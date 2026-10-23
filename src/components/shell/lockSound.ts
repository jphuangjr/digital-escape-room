/**
 * The two lock sounds, built with Web Audio on a game's running ambience (no audio files): a soft brass "thunk"
 * for a wrong guess and a click-and-ring for one that opens. Only games that already play sound call these,
 * and only while the player has sound on.
 */
export type LockCue = "thunk" | "open";

export function playLockCue(ctx: AudioContext, out: AudioNode, cue: LockCue) {
  const at = ctx.currentTime + 0.01;
  const tone = (freq: number, to: number, level: number, len: number, start = at, type: OscillatorType = "sine") => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.frequency.exponentialRampToValueAtTime(to, start + len * 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(level, start + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, start + len);
    o.connect(g).connect(out);
    o.start(start);
    o.stop(start + len + 0.02);
  };
  const tick = (start: number, level: number, freq: number) => {
    const len = 0.04;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(bp).connect(g).connect(out);
    src.start(start);
  };
  if (cue === "thunk") {
    // A dull knock: the wheels stop against the bolt.
    tone(150, 62, 0.22, 0.16);
    tick(at, 0.35, 420);
  } else {
    // Two quick clicks as the bolt draws, then a small bright ring.
    tick(at, 0.3, 2400);
    tick(at + 0.07, 0.35, 1800);
    tone(1320, 1300, 0.05, 0.45, at + 0.09, "triangle");
  }
}
