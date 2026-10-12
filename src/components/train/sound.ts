"use client";

/**
 * Ambient sound for the train: rain on the window and the wheels over the rail joints, generated
 * with Web Audio (no audio files). Browsers only allow sound after a tap, so `start()` is called from
 * a user gesture; the player's mute choice is remembered per device.
 */

export const SOUND_PREF_KEY = "nx_sound";

export function soundPreferred(): boolean {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundPreferred(on: boolean) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, on ? "on" : "off");
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

export class TrainAmbience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private clack: ReturnType<typeof setInterval> | null = null;

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
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2);
    master.connect(ctx.destination);
    this.master = master;

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
      src.connect(bp).connect(g).connect(master);
      src.start(at);
      src.stop(at + 0.13);
    };
    const bar = () => {
      const t = ctx.currentTime + 0.05;
      knock(t, 0.5);
      knock(t + 0.16, 0.4);
    };
    bar();
    this.clack = setInterval(bar, 1150);
  }

  stop() {
    if (this.clack) clearInterval(this.clack);
    this.clack = null;
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    if (ctx) void ctx.close().catch(() => {});
  }
}
