import { describe, expect, it } from "vitest";
import type { AtlasSceneAction } from "@/lib/atlas/types";
import { applyAction, initialScene, parseScene, sceneDTO, type AtlasScene } from "../scene";
import { GLYPH_VALUE } from "../router";
import { atlasGame } from "../game";

const who = { id: "p1", name: "Sam" };
const t0 = new Date("2026-01-01T00:00:00Z");
function run(actions: AtlasSceneAction[], start: AtlasScene = initialScene()) {
  let s = start;
  const results = actions.map((a) => {
    const r = applyAction(s, a, who, undefined, t0);
    s = r.scene;
    return r;
  });
  return { scene: s, results };
}

const TO_WATERWORKS: AtlasSceneAction[] = [
  { type: "unlock", lock: "clock", input: "0435" },
  { type: "take", item: "token" },
  { type: "use", item: "token", target: "stair-door" },
];
const DRAIN: AtlasSceneAction[] = [
  { type: "operate", target: "valves", op: "intake" },
  { type: "operate", target: "valves", op: "reservoir" },
  { type: "operate", target: "valves", op: "reservoir" },
  { type: "operate", target: "valves", op: "outflow" },
  { type: "operate", target: "valves", op: "intake" },
];
const POWER: AtlasSceneAction[] = [
  { type: "take", item: "gear" },
  { type: "use", item: "gear", target: "engine" },
  { type: "unlock", lock: "engine", input: "✶≈◈" },
];

describe("Act I: the Drowned Observatory", () => {
  it("can be played from waking up to the first crossing", () => {
    const { scene, results } = run([...TO_WATERWORKS, ...DRAIN, ...POWER, { type: "dial", outer: "sun", inner: "wave" }]);
    expect(results.map((r) => r.message).filter((_, i) => !results[i].ok)).toEqual([]);
    expect(scene.flags).toEqual(expect.arrayContaining(["clock.set", "stairs.open", "water.drained", "engine.on", "crossed", "reached.verdant"]));
    expect(results.at(-1)?.reply).toEqual({ arrived: "verdant" });
    const dto = sceneDTO(scene);
    expect(dto.places.filter((p) => p.reachable).map((p) => p.id)).toEqual(["observatory", "waterworks", "chamber", "verdant"]);
    expect(dto.log.map((l) => l.text)).toContain("Sam crossed the Threshold to The Verdant Archive");
  });

  it("accepts the clock at 16:35 too, and rejects the decoy constellations", () => {
    expect(applyAction(initialScene(), { type: "unlock", lock: "clock", input: "1635" }, who).ok).toBe(true);
    const wrong = applyAction(initialScene(), { type: "unlock", lock: "clock", input: "0840" }, who); // the ring of five and the line of four
    expect(wrong).toMatchObject({ ok: false, attempt: { lock: "clock", correct: false } });
  });

  it("keeps the waterworks, chamber and Ages out of reach until the way is open", () => {
    const fresh = initialScene();
    expect(applyAction(fresh, { type: "operate", target: "valves", op: "intake" }, who).ok).toBe(false);
    expect(applyAction(fresh, { type: "dial", outer: "sun", inner: "wave" }, who).ok).toBe(false);
    const dto = sceneDTO(fresh);
    expect(Object.keys(dto.closeups).sort()).toEqual(["clock", "journal", "plate", "stair-door", "starchart", "telescope", "window"]);
    expect(dto.closeups.ledger).toBeUndefined();
  });

  it("never sends a code, a glyph's value or an unearned mark", () => {
    const json = JSON.stringify(sceneDTO(initialScene()));
    expect(json).not.toContain("0435");
    expect(json).not.toMatch(/"(star|wave)"/); // the clock and wheel marks show only once earned
    const full = run([...TO_WATERWORKS, ...DRAIN, ...POWER]).scene;
    const all = JSON.stringify(sceneDTO(full));
    expect(all).not.toContain("✶≈◈");
    expect(all).not.toContain("GLYPH_VALUE");
    for (const v of Object.values(GLYPH_VALUE)) expect(all).not.toContain(`"value":${v}`);
  });
});

describe("the three valves", () => {
  const atValves = run(TO_WATERWORKS).scene;
  const turn = (ops: string[], s = atValves) => run(ops.map((op) => ({ type: "operate", target: "valves", op }) as AtlasSceneAction), s);

  it("drains with either order that keeps the standing orders", () => {
    expect(turn(["intake", "reservoir", "reservoir", "outflow", "intake"]).scene.flags).toContain("water.drained");
    expect(turn(["intake", "reservoir", "reservoir", "intake", "outflow"]).scene.flags).toContain("water.drained");
  });

  it("floods and resets every valve when an order is broken", () => {
    for (const ops of [["reservoir"], ["outflow"], ["intake", "outflow"], ["intake", "reservoir", "intake"], ["intake", "reservoir", "outflow"]]) {
      const { scene, results } = turn(ops);
      expect(results.at(-1)).toMatchObject({ ok: false, attempt: { lock: "valves", correct: false } });
      expect(scene.flags.some((f) => f.startsWith("valve.") || f.startsWith("run."))).toBe(false);
      expect(scene.flags).not.toContain("water.drained");
    }
  });

  it("shows the wheel's mark and the gear only once drained", () => {
    expect(sceneDTO(atValves).closeups.wheel?.doc).toBeUndefined();
    expect(sceneDTO(atValves).closeups.tunnel?.takes).toEqual([]);
    const drained = turn(["intake", "reservoir", "reservoir", "outflow", "intake"]).scene;
    expect(sceneDTO(drained).closeups.wheel?.doc).toMatchObject({ kind: "glyph", glyph: "wave" });
    expect(sceneDTO(drained).closeups.tunnel?.takes.map((t) => t.id)).toEqual(["gear"]);
  });
});

describe("the Threshold gate", () => {
  const geared = run([...TO_WATERWORKS, ...DRAIN, { type: "take", item: "gear" }, { type: "use", item: "gear", target: "engine" }]).scene;
  const powered = run([{ type: "unlock", lock: "engine", input: "✶≈◈" }], geared).scene;

  it("won't move without power, and that isn't a misroute", () => {
    const r = applyAction(geared, { type: "dial", outer: "sun", inner: "wave" }, who, undefined, t0);
    expect(r).toMatchObject({ ok: false, changed: false });
    expect(r.attempt).toBeUndefined();
  });

  it("jams for a minute after three misroutes in a row", () => {
    const { scene, results } = run(
      [
        { type: "dial", outer: "moon", inner: "moon" },
        { type: "dial", outer: "moon", inner: "knot" },
        { type: "dial", outer: "sun", inner: "moon" },
      ],
      powered,
    );
    expect(results.map((r) => r.attempt?.correct)).toEqual([false, false, false]);
    expect(sceneDTO(scene, { now: t0 }).closeups.gate?.gate?.jammedUntil).toBeTruthy();
    const blocked = applyAction(scene, { type: "dial", outer: "sun", inner: "wave" }, who, undefined, new Date(t0.getTime() + 30_000));
    expect(blocked.ok).toBe(false);
    const later = applyAction(scene, { type: "dial", outer: "sun", inner: "wave" }, who, undefined, new Date(t0.getTime() + 61_000));
    expect(later.reply).toEqual({ arrived: "verdant" });
  });

  it("refuses glyphs that don't exist", () => {
    expect(applyAction(powered, { type: "dial", outer: "skull" as never, inner: "wave" }, who).ok).toBe(false);
  });
});

describe("the Cartographer's notes", () => {
  it("help with the first unsolved puzzle where you stand", () => {
    const atValves = run(TO_WATERWORKS).scene;
    const r = applyAction(atValves, { type: "hint", where: "waterworks" }, who, undefined, t0);
    expect(sceneDTO(r.scene).hints[0]).toMatchObject({ puzzle: "valves", tier: 1 });
    // Standing somewhere with nothing left to solve falls back to the next puzzle anywhere.
    const h = applyAction(atValves, { type: "hint", where: "observatory" }, who, undefined, t0);
    expect(h.scene.hints[0].puzzle).toBe("valves");
    // A place you can't reach counts as the Observatory.
    expect(applyAction(initialScene(), { type: "hint", where: "chamber" }, who, undefined, t0).scene.hints[0].puzzle).toBe("clock");
  });

  it("come one tier at a time, a minute apart", () => {
    const h1 = applyAction(initialScene(), { type: "hint", where: "observatory" }, who, undefined, t0);
    expect(applyAction(h1.scene, { type: "hint", where: "observatory" }, who, undefined, new Date(t0.getTime() + 10_000)).ok).toBe(false);
    const h2 = applyAction(h1.scene, { type: "hint", where: "observatory" }, who, undefined, new Date(t0.getTime() + 61_000));
    expect(h2.scene.hints.map((h) => h.tier)).toEqual([1, 2]);
    expect(sceneDTO(h2.scene, { now: new Date(t0.getTime() + 62_000) }).nextHints.observatory?.readyAt).toBeTruthy();
  });
});

describe("the registry entry", () => {
  it("parses junk safely and rate-limits locks and the gate", () => {
    expect(parseScene({ flags: [1, "a"], inventory: ["gear", "sword"], jams: { gate: { wrong: 2 } } })).toMatchObject({
      flags: ["a"],
      inventory: ["gear"],
      jams: { gate: { wrong: 2, until: null } },
    });
    expect(atlasGame.guessedLock({ type: "dial", outer: "sun", inner: "wave" })).toBe("gate");
    expect(atlasGame.guessedLock({ type: "unlock", lock: "clock", input: "1" })).toBe("clock");
    expect(atlasGame.guessedLock({ type: "operate", target: "valves", op: "intake" })).toBeNull();
    expect(atlasGame.isAction({ type: "dial" })).toBe(true);
    expect(atlasGame.isAction({ type: "vote" })).toBe(false);
  });
});
