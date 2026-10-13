import { describe, expect, it } from "vitest";
import type { AtlasSceneAction } from "@/lib/atlas/types";
import { applyAction, initialScene, sceneDTO, type AtlasScene } from "../scene";
import { GATE_ORIGIN, GLYPH_VALUE, route } from "../router";
import { atlasGame } from "../game";
import en from "../text/en";

const sam = { id: "p1", name: "Sam" };
const juno = { id: "p2", name: "Juno" };
const t0 = new Date("2026-01-01T00:00:00Z");
const solo = { hostId: "p1", onlineIds: ["p1"] };
const two = { hostId: "p1", onlineIds: ["p1", "p2"] };
function run(actions: AtlasSceneAction[], start: AtlasScene = initialScene(), room = solo) {
  let s = start;
  const results = actions.map((a) => {
    const r = applyAction(s, a, sam, room, t0);
    s = r.scene;
    return r;
  });
  return { scene: s, results };
}
const op = (target: string, o: string) => ({ type: "operate", target, op: o }) as AtlasSceneAction;
const dial = (outer: string, inner: string) => ({ type: "dial", outer, inner }) as AtlasSceneAction;

/** The whole game up to the Cathedral's door: Act I, the three Ages (main puzzles) and their secrets. */
const ACT_ONE: AtlasSceneAction[] = [
  { type: "unlock", lock: "clock", input: "0435" },
  { type: "take", item: "token" },
  { type: "use", item: "token", target: "stair-door" },
  ...["intake", "reservoir", "reservoir", "outflow", "intake"].map((v) => op("valves", v)),
  { type: "take", item: "gear" },
  { type: "use", item: "gear", target: "engine" },
  { type: "unlock", lock: "engine", input: "✶≈◈" },
];
const VERDANT: AtlasSceneAction[] = [
  dial("sun", "wave"),
  { type: "unlock", lock: "index", input: "☾◈≈☉⌘✶△" },
  { type: "take", item: "numerals" },
  { type: "take", item: "can" },
  op("roots", "water:moon"),
  { type: "take", item: "seal-leaf" },
  { type: "take", item: "sun-lens" },
];
const MERIDIAN: AtlasSceneAction[] = [
  dial("star", "peak"),
  ...[0, 1, 4].map((i) => op("mirrors", `mirror:${i}`)),
  { type: "take", item: "hand-mirror" },
  { type: "unlock", lock: "dial", input: "04" },
  { type: "take", item: "engineer-note" },
  { type: "take", item: "seal-sun" },
  { type: "use", item: "sun-lens", target: "vault" },
  { type: "take", item: "star-map" },
];
const PELAGIC: AtlasSceneAction[] = [
  dial("knot", "wave"),
  ...["0:1", "1:2", "2:0", "1:2", "0:1", "1:2"].map((p) => op("tanks", `pour:${p}`)),
  { type: "unlock", lock: "registry", input: "◈≈☉△" },
  { type: "take", item: "seal-tide" },
  { type: "take", item: "brine" },
  { type: "use", item: "hand-mirror", target: "glass" },
  { type: "take", item: "tide-chart" },
  { type: "use", item: "brine", target: "seed" },
  { type: "take", item: "night-bloom" },
];
const SEATS: AtlasSceneAction[] = [
  { type: "seat", seal: "seal-leaf", socket: "eye" },
  { type: "seat", seal: "seal-sun", socket: "wave" },
  { type: "seat", seal: "seal-tide", socket: "sun" },
];
const allAges = run([...ACT_ONE, ...VERDANT, ...MERIDIAN, ...PELAGIC]);
const REROUTE: AtlasSceneAction = {
  type: "reroute",
  rings: { verdant: { outer: "sun", inner: "moon" }, meridian: { outer: "wave", inner: "eye" }, pelagic: { outer: "wave", inner: "moon" } },
};

describe("Act III and the endings", () => {
  it("plays the whole game, every secret included, to the Reroute ending", () => {
    expect(allAges.results.filter((r) => !r.ok).map((r) => r.message)).toEqual([]);
    const { scene, results } = run([...SEATS, dial("sun", "moon"), REROUTE, op("core", "convene"), { type: "vote", choice: "reroute" }], allAges.scene);
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([]);
    expect(results.at(-1)?.finished).toBe(true);
    const dto = sceneDTO(scene, { startedAt: new Date(t0.getTime() - 100 * 60000) });
    expect(dto.ending).toMatchObject({ choice: "reroute", title: "The Atlas Redrawn", secretsFound: 3, secretsTotal: 3, minutes: 100 });
    expect(atlasGame.ending(scene)).toEqual({ ending: "reroute", solved: true, hintsUsed: 0 });
    expect(atlasGame.badges(scene)).toEqual(["atlas-secrets", "atlas-reroute"]);
    // Nothing else can happen once it's over.
    expect(applyAction(scene, op("core", "convene"), sam).ok).toBe(false);
  });

  it("restores the Cathedral's registration only when every seal is in its own Age's socket", () => {
    const before = allAges.scene;
    expect(applyAction(before, dial("sun", "moon"), sam, solo, t0).message).toBe(en["msg.gate.withheld"]);
    const wrong = applyAction(before, { type: "seat", seal: "seal-sun", socket: "sun" }, sam, solo, t0); // the Sun goes in ≈, not ☉
    expect(wrong).toMatchObject({ ok: false, attempt: { lock: "plate", correct: false } });
    expect(wrong.scene.inventory).toContain("seal-sun");
    const { scene, results } = run(SEATS, before);
    expect(results.at(-1)?.message).toBe(en["msg.registered"]);
    expect(sceneDTO(scene).closeups.plate?.plate?.registered).toBe(true);
    const cross = applyAction(scene, dial("sun", "moon"), sam, solo, t0);
    expect(cross.reply).toEqual({ arrived: "cathedral" });
  });

  it("matches the hints: ☉/☾ reaches node 6, and each Age's reroute comes home to 0", () => {
    expect(route(GATE_ORIGIN.observatory, GLYPH_VALUE.sun, GLYPH_VALUE.moon, 7)).toBe(6);
    expect(en["hint.route.3"]).toContain("Outer ring ☉ (3), inner ring ☾ (0)");
    if (REROUTE.type !== "reroute") throw new Error();
    for (const [age, r] of Object.entries(REROUTE.rings)) {
      expect(route(GATE_ORIGIN[age as keyof typeof GATE_ORIGIN], GLYPH_VALUE[r.outer], GLYPH_VALUE[r.inner], 7)).toBe(0);
    }
  });

  it("offers Reroute only with all three secrets and a correct reroute", () => {
    // Without the night bloom, the rings won't move.
    const missing = run([...ACT_ONE, ...VERDANT, ...MERIDIAN, ...PELAGIC.slice(0, -2)]).scene;
    const atCore = run([...SEATS, dial("sun", "moon")], missing).scene;
    expect(applyAction(atCore, REROUTE, sam).message).toBe(en["msg.rerouteNeedsSecrets"]);
    const convened = applyAction(atCore, op("core", "convene"), sam).scene;
    expect(sceneDTO(convened).vote?.choices.map((c) => c.id)).toEqual(["restore", "sever"]);
    expect(applyAction(convened, { type: "vote", choice: "reroute" }, sam, solo).ok).toBe(false);
    // With every secret, a wrong setting is refused and counts towards a jam; the right one unlocks the choice.
    const ready = run([...SEATS, dial("sun", "moon")], allAges.scene).scene;
    const bad = applyAction(ready, { ...REROUTE, rings: { ...REROUTE.rings, verdant: { outer: "moon", inner: "moon" } } } as AtlasSceneAction, sam, solo, t0);
    expect(bad).toMatchObject({ ok: false, attempt: { lock: "core", correct: false } });
    const good = run([REROUTE, op("core", "convene")], ready).scene;
    expect(sceneDTO(good).vote?.choices.map((c) => c.id)).toEqual(["restore", "sever", "reroute"]);
  });

  it("holds everything else while the room votes, waits for everyone online, and hands a tie to the host", () => {
    const atCore = run([...SEATS, dial("sun", "moon"), op("core", "convene")], allAges.scene).scene;
    expect(applyAction(atCore, op("tanks", "reset"), sam, two).message).toBe(en["msg.waiting"]);
    const a = applyAction(atCore, { type: "vote", choice: "sever" }, sam, two, t0);
    expect(a.finished).toBeFalsy();
    const b = applyAction(a.scene, { type: "vote", choice: "restore" }, juno, two, t0);
    expect(b.scene.vote?.tie).toEqual(["restore", "sever"]);
    expect(applyAction(b.scene, { type: "tiebreak", choice: "sever" }, juno, two, t0).ok).toBe(false);
    const end = applyAction(b.scene, { type: "tiebreak", choice: "sever" }, sam, two, t0);
    expect(end.finished).toBe(true);
    expect(sceneDTO(end.scene).ending).toMatchObject({ choice: "sever", title: "The Silent Worlds" });
    expect(atlasGame.badges(end.scene)).toEqual(["atlas-secrets"]);
    expect(sceneDTO(end.scene).log.at(-1)?.text).toBe("The room decided: Sever the Ages");
  });

  it("only offers the Act III notes once they can be acted on", () => {
    // Every Age's main puzzle solved but no seal seated: the plate is next, wherever you stand.
    expect(applyAction(allAges.scene, { type: "hint", where: "observatory" }, sam, solo, t0).scene.hints.at(-1)?.puzzle).toBe("plate");
    // Before the Ages are done, the Observatory's notes don't jump ahead to the plate.
    const early = run(ACT_ONE).scene;
    expect(applyAction(early, { type: "hint", where: "observatory" }, sam, solo, t0).scene.hints.at(-1)?.puzzle).toBe("gate");
  });

  it("counts every ending as an escape", () => {
    expect(["restore", "sever", "reroute"].every((e) => atlasGame.solvedEnding(e))).toBe(true);
    expect(atlasGame.solvedEnding(null)).toBe(false);
  });
});
