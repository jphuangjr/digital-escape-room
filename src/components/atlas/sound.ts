"use client";

import type { LocationId } from "@/lib/atlas/types";
import { playLockCue, type LockCue } from "@/components/shell/lockSound";

/**
 * Ambient sound for The Atlas of Silent Worlds: one soundscape per place, generated with Web Audio (no audio files)
 * and crossfaded as the player moves. Browsers only allow sound after a tap, so `start()` is called from a user
 * gesture; the player's mute choice is remembered per device.
 */

const PREF_KEY = "atlas_sound";

export function soundPreferred(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundPreferred(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {}
}

function noiseBuffer(ctx: AudioContext, seconds: number, brown = false): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

type Mood = "rain" | "drips" | "vault" | "glasshouse" | "desert" | "shade" | "deep" | "void";

const MOOD: Record<LocationId, Mood> = {
  observatory: "rain",
  waterworks: "drips",
  chamber: "vault",
  verdant: "glasshouse",
  meridian: "desert",
  sanctum: "shade",
  pelagic: "deep",
  archive: "deep",
  cathedral: "void",
};

/** One running soundscape: its gain (for crossfading) and how to stop it. */
interface Layer {
  gain: GainNode;
  stop: () => void;
}

export class AtlasAmbience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private brown: AudioBuffer | null = null;
  private layer: { mood: Mood; layer: Layer } | null = null;
  private place: LocationId = "observatory";

  get running() {
    return this.ctx !== null;
  }

  start() {
    if (this.ctx) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    this.master = master;
    this.noise = noiseBuffer(ctx, 4);
    this.brown = noiseBuffer(ctx, 6, true);
    this.layer = null;
    this.setPlace(this.place);
  }

  stop() {
    this.layer?.layer.stop();
    this.layer = null;
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    if (ctx) void ctx.close().catch(() => {});
  }

  /** A lock's thunk or click, over the soundscape (silent while sound is off). */
  cue(cue: LockCue) {
    if (this.ctx && this.master) playLockCue(this.ctx, this.master, cue);
  }

  /** Crossfade to the soundscape of a place (kept and applied on start when sound is off). */
  setPlace(place: LocationId) {
    this.place = place;
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const mood = MOOD[place];
    if (this.layer?.mood === mood) return;
    const now = ctx.currentTime;
    const old = this.layer?.layer;
    if (old) {
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + 1.6);
      setTimeout(() => old.stop(), 1800);
    }
    const layer = this.build(ctx, mood);
    layer.gain.gain.setValueAtTime(0, now);
    layer.gain.gain.linearRampToValueAtTime(1, now + 2.2);
    this.layer = { mood, layer };
  }

  // ---------- building blocks ----------

  /** A looping noise bed through a filter. */
  private bed(out: AudioNode, opts: { brown?: boolean; type: BiquadFilterType; freq: number; q?: number; level: number; wobble?: { rate: number; depth: number } }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = opts.brown ? this.brown : this.noise;
    src.loop = true;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 0.7;
    const g = ctx.createGain();
    g.gain.value = opts.level;
    src.connect(f).connect(g).connect(out);
    const stops: (() => void)[] = [() => src.stop()];
    // A slow swell on the filter: wind gusting, water moving.
    if (opts.wobble) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = opts.wobble.rate;
      const depth = ctx.createGain();
      depth.gain.value = opts.wobble.depth;
      lfo.connect(depth).connect(f.frequency);
      lfo.start();
      stops.push(() => lfo.stop());
    }
    src.start();
    return () => stops.forEach((s) => s());
  }

  /** A held tone (or chord) with a slow tremolo: the hum of old machinery, the air of a vast room. */
  private drone(out: AudioNode, freqs: number[], level: number, type: OscillatorType = "sine") {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = level;
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.12;
    const tremDepth = ctx.createGain();
    tremDepth.gain.value = level * 0.35;
    trem.connect(tremDepth).connect(g.gain);
    g.connect(out);
    const oscs = freqs.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * 4;
      o.connect(g);
      o.start();
      return o;
    });
    trem.start();
    return () => {
      oscs.forEach((o) => o.stop());
      trem.stop();
    };
  }

  /** Occasional small sounds at random intervals while the layer lives (a drip, a bubble, a creak). */
  private every(minMs: number, maxMs: number, play: (at: number) => void) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let live = true;
    const next = () => {
      timer = setTimeout(() => {
        if (!live || !this.ctx) return;
        play(this.ctx.currentTime + 0.02);
        next();
      }, minMs + Math.random() * (maxMs - minMs));
    };
    next();
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }

  /** A pitched blip: a drip into a pool (falling pitch) or a bubble (rising pitch). */
  private blip(out: AudioNode, at: number, from: number, to: number, level: number, length = 0.18) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + length * 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, at + length);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + length + 0.02);
  }

  private build(ctx: AudioContext, mood: Mood): Layer {
    const gain = ctx.createGain();
    gain.connect(this.master!);
    const stops: (() => void)[] = [];
    switch (mood) {
      case "rain": // rain on the Observatory's glass, wind round the dome
        stops.push(this.bed(gain, { type: "bandpass", freq: 2600, q: 0.6, level: 0.07 }));
        stops.push(this.bed(gain, { brown: true, type: "lowpass", freq: 380, level: 0.22, wobble: { rate: 0.07, depth: 160 } }));
        stops.push(this.every(500, 1600, (at) => this.blip(gain, at, 2400 + Math.random() * 1600, 1800, 0.015, 0.05)));
        break;
      case "drips": // the Waterworks: water moving in the dark, drips into pools
        stops.push(this.bed(gain, { brown: true, type: "lowpass", freq: 260, level: 0.35, wobble: { rate: 0.05, depth: 90 } }));
        stops.push(this.every(700, 2600, (at) => this.blip(gain, at, 1400 + Math.random() * 900, 520, 0.09, 0.22)));
        break;
      case "vault": // the Threshold Chamber: the gate's low hum
        stops.push(this.drone(gain, [55, 82.4, 110.2], 0.05, "triangle"));
        stops.push(this.bed(gain, { brown: true, type: "lowpass", freq: 200, level: 0.18 }));
        break;
      case "glasshouse": // the Verdant Archive: leaves in a warm draught, the odd drip from the panes
        stops.push(this.bed(gain, { type: "bandpass", freq: 1400, q: 0.4, level: 0.05, wobble: { rate: 0.09, depth: 700 } }));
        stops.push(this.bed(gain, { brown: true, type: "lowpass", freq: 300, level: 0.12 }));
        stops.push(this.every(1800, 5200, (at) => this.blip(gain, at, 1900 + Math.random() * 700, 900, 0.05, 0.2)));
        break;
      case "desert": // the Sunken Meridian: wind over sand, gusting
        stops.push(this.bed(gain, { type: "bandpass", freq: 700, q: 0.8, level: 0.14, wobble: { rate: 0.06, depth: 450 } }));
        stops.push(this.bed(gain, { type: "highpass", freq: 4200, level: 0.025, wobble: { rate: 0.11, depth: 1200 } }));
        break;
      case "shade": // the Sanctum: the wind muffled by stone, a still low air
        stops.push(this.bed(gain, { type: "bandpass", freq: 420, q: 0.9, level: 0.08, wobble: { rate: 0.05, depth: 180 } }));
        stops.push(this.drone(gain, [98, 147], 0.018));
        break;
      case "deep": // the Pelagic Library: the sea pressing on glass, bubbles rising
        stops.push(this.bed(gain, { brown: true, type: "lowpass", freq: 180, level: 0.4, wobble: { rate: 0.04, depth: 70 } }));
        stops.push(this.drone(gain, [41.2], 0.04));
        stops.push(this.every(900, 3000, (at) => this.blip(gain, at, 280 + Math.random() * 200, 900 + Math.random() * 500, 0.05, 0.14)));
        break;
      case "void": // the Null Cathedral: a vast, resonant stillness
        stops.push(this.drone(gain, [55, 82.4, 110, 164.8], 0.035));
        stops.push(this.bed(gain, { type: "bandpass", freq: 900, q: 0.3, level: 0.03, wobble: { rate: 0.03, depth: 400 } }));
        break;
    }
    return { gain, stop: () => stops.forEach((s) => s()) };
  }
}
