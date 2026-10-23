"use client";

import { noiseBuffer, type Ambience } from "./gameSound";

/**
 * Ambient sound for Ada's laptop: the soft rush of its fan, a faint motor whine under it, and the low tone of a
 * quiet room, generated with Web Audio (no audio files). It plays through the shared game sound (gameSound.ts),
 * which starts it after a tap and owns the switch. Sound is off here unless the player turns it on.
 */

export const SOUND_PREF_KEY = "escape_sound";

export class LaptopAmbience implements Ambience {
  private stops: (() => void)[] = [];

  start(ctx: AudioContext, out: AudioNode) {
    this.stop();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(out);

    // The fan: air through a small grille, swelling a little now and then.
    const fan = ctx.createBufferSource();
    fan.buffer = noiseBuffer(ctx, 4);
    fan.loop = true;
    const fanBp = ctx.createBiquadFilter();
    fanBp.type = "bandpass";
    fanBp.frequency.value = 520;
    fanBp.Q.value = 0.5;
    const fanLp = ctx.createBiquadFilter();
    fanLp.type = "lowpass";
    fanLp.frequency.value = 1400;
    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.045;
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.05;
    const swellDepth = ctx.createGain();
    swellDepth.gain.value = 0.012;
    swell.connect(swellDepth).connect(fanGain.gain);
    fan.connect(fanBp).connect(fanLp).connect(fanGain).connect(master);

    // Its motor: a faint, slightly wavering whine.
    const whine = ctx.createOscillator();
    whine.type = "sine";
    whine.frequency.value = 196;
    const waver = ctx.createOscillator();
    waver.frequency.value = 0.2;
    const waverDepth = ctx.createGain();
    waverDepth.gain.value = 1.5;
    waver.connect(waverDepth).connect(whine.frequency);
    const whineGain = ctx.createGain();
    whineGain.gain.value = 0.004;
    whine.connect(whineGain).connect(master);

    // The room: a low, still air.
    const room = ctx.createBufferSource();
    room.buffer = noiseBuffer(ctx, 5, true);
    room.loop = true;
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 220;
    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.12;
    room.connect(roomLp).connect(roomGain).connect(master);

    const nodes = [fan, swell, whine, waver, room];
    nodes.forEach((n) => n.start());
    this.stops = [() => nodes.forEach((n) => n.stop())];
  }

  setPlace() {}

  stop() {
    this.stops.forEach((s) => {
      try {
        s();
      } catch {}
    });
    this.stops = [];
  }
}
