"use client";

import { playLockCue, type LockCue } from "./lockSound";

/**
 * One quiet sound layer for every game, generated with Web Audio (no audio files): a low ambience per room or
 * place, short UI sounds (a hotspot, a close-up, an item picked up, a wall turned, the room sheet), and the lock
 * and solve sounds, all through one master gain so one switch silences everything. The switch is remembered per
 * device under each game's own key. Browsers only allow sound after a gesture, so nothing starts until a tap;
 * the sound pauses while the tab is hidden.
 */

/** A game's soundscape. It plays into `out` on the shared context and is told where the player is. */
export interface Ambience {
  start(ctx: AudioContext, out: AudioNode): void;
  setPlace(place: string): void;
  /** Clear timers and drop nodes (the context itself is closed by GameSound). */
  stop(): void;
}

export type UiSound = "tap" | "open" | "take" | "turn" | "sheet" | "type" | "mail";

/** Overall level: the ambience sits low under everything, the UI sounds just above it. */
const MASTER = 0.5;
const AMBIENCE = 0.7;
const UI = 0.8;

/**
 * Tests can set `window.__soundProbe = {}` before the page loads to count what this layer plays (nobody can listen
 * in a headless browser). Without it nothing is recorded.
 */
type Probe = Record<string, unknown> & { counts?: Record<string, number> };
function probe(): Probe | undefined {
  return typeof window === "undefined" ? undefined : (window as unknown as { __soundProbe?: Probe }).__soundProbe;
}
export function noteSound(name: string) {
  const p = probe();
  if (!p) return;
  p.counts ??= {};
  p.counts[name] = (p.counts[name] ?? 0) + 1;
}

export function noiseBuffer(ctx: AudioContext, seconds: number, brown = false): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
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

/** The sound of the game on screen, for code below the shell (locks, solve moments) to reach without props. */
let active: GameSound | null = null;
export function activeGameSound(): GameSound | null {
  return active;
}

export class GameSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ui: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private on: boolean;
  private hidden = false;
  private lastType = 0;
  private pendingTap: ReturnType<typeof setTimeout> | null = null;
  private lastCue = 0;

  constructor(
    private prefKey: string,
    private defaultOn: boolean,
    private ambience: Ambience | null,
  ) {
    this.on = this.readPref();
  }

  private readPref(): boolean {
    try {
      const v = localStorage.getItem(this.prefKey);
      return v === null ? this.defaultOn : v !== "off";
    } catch {
      return this.defaultOn;
    }
  }

  get enabled() {
    return this.on;
  }

  /** Make this the game on screen (for activeGameSound). */
  attach() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- one game on screen at a time
    active = this;
  }

  detach() {
    if (active === this) active = null;
    this.shutdown();
  }

  /** Turn all of the game's sound on or off, and remember it. Call from a tap so it can start at once. */
  setEnabled(on: boolean) {
    this.on = on;
    try {
      localStorage.setItem(this.prefKey, on ? "on" : "off");
    } catch {}
    if (on) this.wake();
    else this.shutdown();
  }

  /** Called on every user gesture: start (or resume) the sound if it's on. */
  wake() {
    if (!this.on || this.hidden) return;
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    let ctx: AudioContext;
    try {
      ctx = new AC();
    } catch {
      return;
    }
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(MASTER, ctx.currentTime + 2);
    master.connect(ctx.destination);
    this.master = master;
    const amb = ctx.createGain();
    amb.gain.value = AMBIENCE;
    amb.connect(master);
    const ui = ctx.createGain();
    ui.gain.value = UI;
    ui.connect(master);
    this.ui = ui;
    this.noise = noiseBuffer(ctx, 1);
    this.ambience?.start(ctx, amb);
    noteSound("ambience:start");
    const p = probe();
    if (p) p.context = ctx;
  }

  private shutdown() {
    if (this.pendingTap) clearTimeout(this.pendingTap);
    this.pendingTap = null;
    this.ambience?.stop();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.ui = null;
    if (ctx) void ctx.close().catch(() => {});
  }

  /** Pause everything while the tab is hidden; carry on when it's back. */
  setHidden(hidden: boolean) {
    this.hidden = hidden;
    const ctx = this.ctx;
    if (!ctx) return;
    if (hidden) void ctx.suspend().catch(() => {});
    else if (this.on) void ctx.resume().catch(() => {});
    noteSound(hidden ? "suspend" : "resume");
  }

  setPlace(place: string) {
    this.ambience?.setPlace(place);
  }

  /** The context, only while it is actually playing. */
  private live(): AudioContext | null {
    return this.ctx && this.ctx.state === "running" ? this.ctx : null;
  }

  /** A lock's thunk or click-and-ring. */
  lock(cue: LockCue) {
    const ctx = this.live();
    if (!ctx || !this.ui) return;
    this.lastCue = performance.now();
    playLockCue(ctx, this.ui, cue);
    noteSound(`lock:${cue}`);
  }

  /** Two soft bell partials, a fifth apart: someone in the room solved something. */
  chime() {
    const ctx = this.live();
    if (!ctx || !this.ui) return;
    const t0 = ctx.currentTime + 0.02;
    this.tone(784, 784, 0.12, 0.9, t0, "triangle");
    this.tone(1175, 1175, 0.09, 0.9, t0 + 0.11, "triangle");
    noteSound("chime");
  }

  /** A short UI sound. A bare "tap" waits a moment and gives way to anything richer the same tap set off. */
  play(kind: UiSound) {
    const ctx = this.live();
    if (!ctx || !this.ui) return;
    const now = performance.now();
    if (kind === "tap") {
      if (this.pendingTap) return;
      const queued = now;
      this.pendingTap = setTimeout(() => {
        this.pendingTap = null;
        const c = this.live();
        if (!c || this.lastCue >= queued) return;
        // A small dry tick.
        this.hiss(c.currentTime + 0.01, 0.03, 2800, 2800, 0.12, 3);
        noteSound("ui:tap");
      }, 60);
      return;
    }
    if (kind === "type") {
      if (now - this.lastType < 45) return;
      this.lastType = now;
    } else this.lastCue = now;
    const at = ctx.currentTime + 0.01;
    switch (kind) {
      case "type": // a key: tinier still, a little different each time
        this.hiss(at, 0.018, 3600 + Math.random() * 1400, 3600, 0.07, 4);
        break;
      case "open": // a close-up lifts: a soft paper swish over a low note
        this.hiss(at, 0.2, 700, 2000, 0.09, 0.8);
        this.tone(330, 340, 0.035, 0.3, at + 0.02);
        break;
      case "take": // into the pocket: two soft plucks, rising
        this.tone(660, 660, 0.06, 0.25, at, "triangle");
        this.tone(990, 990, 0.05, 0.35, at + 0.08, "triangle");
        break;
      case "turn": // turning round: a slow low whoosh
        this.hiss(at, 0.32, 300, 1100, 0.08, 0.6, true);
        break;
      case "sheet": // the room sheet slides up
        this.hiss(at, 0.22, 400, 1300, 0.05, 0.7);
        break;
      case "mail": // new mail: a soft two-note blip
        this.tone(880, 880, 0.045, 0.22, at);
        this.tone(1320, 1320, 0.04, 0.3, at + 0.12);
        break;
    }
    noteSound(`ui:${kind}`);
  }

  private tone(from: number, to: number, level: number, len: number, start: number, type: OscillatorType = "sine") {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(from, start);
    if (to !== from) o.frequency.exponentialRampToValueAtTime(to, start + len * 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(level, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0005, start + len);
    o.connect(g).connect(this.ui!);
    o.start(start);
    o.stop(start + len + 0.02);
  }

  /** Filtered noise with a sweep (swishes, whooshes) or a sharp short one (ticks). */
  private hiss(start: number, len: number, from: number, to: number, level: number, q: number, swell = false) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(from, start);
    if (to !== from) f.frequency.exponentialRampToValueAtTime(to, start + len * (swell ? 0.5 : 0.9));
    if (swell) f.frequency.exponentialRampToValueAtTime(from, start + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(level, start + (len > 0.1 ? len * 0.35 : 0.002));
    g.gain.exponentialRampToValueAtTime(0.0005, start + len);
    src.connect(f).connect(g).connect(this.ui!);
    src.start(start);
    src.stop(start + len + 0.02);
  }
}
