"use client";

import type { TrainRoomId } from "@/lib/train/types";
import { noiseBuffer, noteSound, type Ambience } from "@/components/shell/gameSound";

/**
 * Ambient sound for the train: the carriage's soft hum, rain on the window and the wheels over the rail joints,
 * generated with Web Audio (no audio files), mixed for where the player stands: the wheels louder in the corridor
 * (nearer the bogies, with a draught at the windows), the rain muffled and a murmur of diners in the dining car.
 * It plays through the shared game sound (shell/gameSound.ts), which starts it after a tap and owns the switch.
 */

/** The player's sound switch on this device ("on" / "off"); sound is on unless turned off. */
export const SOUND_PREF_KEY = "nx_sound";

export class TrainAmbience implements Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private clack: ReturnType<typeof setInterval> | null = null;
  private clink: ReturnType<typeof setTimeout> | null = null;
  private place: TrainRoomId = "12b";
  /** The layers each carriage mixes differently. */
  private mix: { rumble: GainNode; rain: GainNode; clack: GainNode; draught: GainNode; murmur: GainNode } | null = null;

  start(ctx: AudioContext, out: AudioNode) {
    if (this.ctx) return;
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(out);
    this.master = master;

    // The carriage's own hum: a low electrical drone with a slow sway.
    const hum = ctx.createGain();
    hum.gain.value = 0.022;
    const sway = ctx.createOscillator();
    sway.frequency.value = 0.15;
    const swayDepth = ctx.createGain();
    swayDepth.gain.value = 0.007;
    sway.connect(swayDepth).connect(hum.gain);
    sway.start();
    for (const [f, type, level] of [[50, "sine", 1], [100, "sine", 0.45], [150, "triangle", 0.12]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = level;
      o.connect(g).connect(hum);
      o.start();
    }
    hum.connect(master);

    // Low rumble of the carriage.
    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer(ctx, 4, true);
    rumble.loop = true;
    const rumbleLp = ctx.createBiquadFilter();
    rumbleLp.type = "lowpass";
    rumbleLp.frequency.value = 140;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.55;
    rumble.connect(rumbleLp).connect(rumbleGain).connect(master);
    const clackBus = ctx.createGain();
    clackBus.connect(master);
    rumble.start();

    // Rain against the glass.
    const rain = ctx.createBufferSource();
    rain.buffer = noiseBuffer(ctx, 3);
    rain.loop = true;
    const rainBp = ctx.createBiquadFilter();
    rainBp.type = "bandpass";
    rainBp.frequency.value = 2400;
    rainBp.Q.value = 0.5;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.06;
    rain.connect(rainBp).connect(rainGain).connect(master);
    rain.start();

    // Clickety-clack: two quick knocks every bar as the wheels cross a rail joint.
    const knockBuf = noiseBuffer(ctx, 0.12);
    const knock = (at: number, level: number) => {
      const src = ctx.createBufferSource();
      src.buffer = knockBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 260;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(level, at + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.11);
      src.connect(bp).connect(g).connect(clackBus);
      src.start(at);
      src.stop(at + 0.13);
    };
    const bar = () => {
      // Nothing piles up while the sound is paused (the tab hidden).
      if (ctx.state !== "running") return;
      noteSound("ambience:clack");
      const t = ctx.currentTime + 0.05;
      knock(t, 0.5);
      knock(t + 0.16, 0.4);
    };
    bar();
    this.clack = setInterval(bar, 1150);

    // A draught whistling past the corridor windows.
    const draught = ctx.createBufferSource();
    draught.buffer = noiseBuffer(ctx, 3);
    draught.loop = true;
    const draughtBp = ctx.createBiquadFilter();
    draughtBp.type = "bandpass";
    draughtBp.frequency.value = 900;
    draughtBp.Q.value = 2.5;
    const draughtLfo = ctx.createOscillator();
    draughtLfo.frequency.value = 0.08;
    const draughtDepth = ctx.createGain();
    draughtDepth.gain.value = 300;
    draughtLfo.connect(draughtDepth).connect(draughtBp.frequency);
    draughtLfo.start();
    const draughtGain = ctx.createGain();
    draughtGain.gain.value = 0;
    draught.connect(draughtBp).connect(draughtGain).connect(master);
    draught.start();

    // The dining car's low murmur of voices.
    const murmur = ctx.createBufferSource();
    murmur.buffer = noiseBuffer(ctx, 4, true);
    murmur.loop = true;
    const murmurBp = ctx.createBiquadFilter();
    murmurBp.type = "bandpass";
    murmurBp.frequency.value = 420;
    murmurBp.Q.value = 1.4;
    const murmurLfo = ctx.createOscillator();
    murmurLfo.frequency.value = 0.35;
    const murmurDepth = ctx.createGain();
    murmurDepth.gain.value = 120;
    murmurLfo.connect(murmurDepth).connect(murmurBp.frequency);
    murmurLfo.start();
    const murmurGain = ctx.createGain();
    murmurGain.gain.value = 0;
    murmur.connect(murmurBp).connect(murmurGain).connect(master);
    murmur.start();

    this.mix = { rumble: rumbleGain, rain: rainGain, clack: clackBus, draught: draughtGain, murmur: murmurGain };
    this.applyMix(true);
    this.scheduleClink();
  }

  /** Mix for where the player is standing (kept and applied on start when sound is off). */
  setPlace(place: string) {
    this.place = place as TrainRoomId;
    this.applyMix(false);
  }

  private applyMix(now: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.mix) return;
    const levels: Record<TrainRoomId, { rumble: number; rain: number; clack: number; draught: number; murmur: number }> = {
      "12b": { rumble: 0.55, rain: 0.06, clack: 1, draught: 0, murmur: 0 },
      corridor: { rumble: 0.7, rain: 0.045, clack: 1.45, draught: 0.05, murmur: 0 },
      dining: { rumble: 0.42, rain: 0.03, clack: 0.65, draught: 0, murmur: 0.09 },
    };
    const target = levels[this.place];
    const at = ctx.currentTime;
    for (const k of Object.keys(target) as (keyof typeof target)[]) {
      const g = this.mix[k].gain;
      g.cancelScheduledValues(at);
      if (now) g.setValueAtTime(target[k], at);
      else {
        g.setValueAtTime(g.value, at);
        g.linearRampToValueAtTime(target[k], at + 1.5);
      }
    }
  }

  /** Now and then in the dining car, glass or cutlery clinks. */
  private scheduleClink() {
    this.clink = setTimeout(() => {
      const ctx = this.ctx;
      if (!ctx || !this.master) return;
      if (this.place === "dining" && ctx.state === "running") {
        const at = ctx.currentTime + 0.02;
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = 2600 + Math.random() * 2200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.025, at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0005, at + 0.35);
        o.connect(g).connect(this.master);
        o.start(at);
        o.stop(at + 0.4);
      }
      this.scheduleClink();
    }, 2500 + Math.random() * 6000);
  }

  stop() {
    if (this.clack) clearInterval(this.clack);
    this.clack = null;
    if (this.clink) clearTimeout(this.clink);
    this.clink = null;
    this.mix = null;
    this.ctx = null;
    this.master = null;
  }
}
