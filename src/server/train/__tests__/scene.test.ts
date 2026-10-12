import { describe, expect, it } from "vitest";
import type { SceneAction } from "@/lib/train/types";
import { applyAction, initialScene, sceneDTO, type RoomCtx, type TrainScene } from "../scene";

const who = { id: "p1", name: "Sam" };
function run(actions: SceneAction[], start: TrainScene = initialScene(), room?: RoomCtx) {
  let s = start;
  const results = actions.map((a) => {
    const r = applyAction(s, a, who, room);
    s = r.scene;
    return r;
  });
  return { scene: s, results };
}

describe("Compartment 12B", () => {
  it("can be escaped from start to finish", () => {
    const { scene, results } = run([
      { type: "take", item: "pouch" },
      { type: "operate", target: "coat", op: "search" },
      { type: "take", item: "washstand-key" },
      { type: "unlock", lock: "suitcase", input: "247" },
      { type: "take", item: "screwdriver" },
      { type: "take", item: "telegram-left" },
      { type: "use", item: "washstand-key", target: "washstand" },
      { type: "operate", target: "washstand", op: "hot" },
      { type: "use", item: "screwdriver", target: "vent" },
      { type: "take", item: "telegram-right" },
      { type: "take", item: "cufflink" },
      { type: "combine", items: ["telegram-left", "telegram-right"] },
      { type: "use", item: "screwdriver", target: "door" },
      { type: "unlock", lock: "door", input: "4196" },
    ]);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(scene.flags).toContain("door.open");
    expect(scene.inventory.sort()).toEqual(["cufflink", "pouch", "screwdriver", "telegram"]);
    expect(scene.log.map((l) => l.text)).toContain("opened the compartment door");
  });

  it("hides items until they're uncovered and never offers them twice", () => {
    expect(applyAction(initialScene(), { type: "take", item: "washstand-key" }, who).ok).toBe(false);
    expect(applyAction(initialScene(), { type: "take", item: "screwdriver" }, who).ok).toBe(false);
    const { scene } = run([{ type: "take", item: "pouch" }]);
    expect(applyAction(scene, { type: "take", item: "pouch" }, who).ok).toBe(false);
    expect(sceneDTO(scene).closeups["under-berth"]?.takes).toEqual([]);
  });

  it("records wrong padlock guesses without changing anything", () => {
    const r = applyAction(initialScene(), { type: "unlock", lock: "suitcase", input: "284" }, who);
    expect(r).toMatchObject({ ok: false, changed: false, attempt: { lock: "suitcase", input: "284", correct: false } });
    // The door dial can't be tried until the service plate is off.
    expect(applyAction(initialScene(), { type: "unlock", lock: "door", input: "4196" }, who).ok).toBe(false);
  });

  it("doesn't use what you don't hold", () => {
    expect(applyAction(initialScene(), { type: "use", item: "screwdriver", target: "vent" }, who).ok).toBe(false);
    expect(applyAction(initialScene(), { type: "combine", items: ["telegram-left", "telegram-right"] }, who).ok).toBe(false);
  });

  it("never sends a lock code or the mirror message before it's earned", () => {
    const fresh = JSON.stringify(sceneDTO(initialScene()));
    expect(fresh).not.toContain("4196");
    expect(fresh).not.toContain("247");
    expect(fresh).not.toContain("LOOK UP");
    expect(fresh).not.toContain("PLATFORM NUMBERS");
    const { scene } = run([
      { type: "operate", target: "coat", op: "search" },
      { type: "take", item: "washstand-key" },
      { type: "use", item: "washstand-key", target: "washstand" },
      { type: "operate", target: "washstand", op: "hot" },
    ]);
    expect(sceneDTO(scene).mirrorLetters).toBe("LOOK UP");
  });
});

const ROOM_1: SceneAction[] = [
  { type: "take", item: "pouch" },
  { type: "operate", target: "coat", op: "search" },
  { type: "take", item: "washstand-key" },
  { type: "unlock", lock: "suitcase", input: "247" },
  { type: "take", item: "screwdriver" },
  { type: "take", item: "telegram-left" },
  { type: "use", item: "washstand-key", target: "washstand" },
  { type: "operate", target: "washstand", op: "hot" },
  { type: "use", item: "screwdriver", target: "vent" },
  { type: "take", item: "telegram-right" },
  { type: "take", item: "cufflink" },
  { type: "combine", items: ["telegram-left", "telegram-right"] },
  { type: "use", item: "screwdriver", target: "door" },
  { type: "unlock", lock: "door", input: "4196" },
];
const DINING: SceneAction[] = [
  { type: "take", item: "scorecard" },
  { type: "unlock", lock: "cashbox", input: "♦♠♣♥" },
  { type: "take", item: "keyring" },
  { type: "take", item: "crank" },
  { type: "operate", target: "stole", op: "search" },
  { type: "take", item: "powder" },
  { type: "item", item: "powder", op: "peel" },
  { type: "operate", target: "records", op: "search" },
  { type: "take", item: "bank-notice" },
  { type: "use", item: "keyring", target: "dumbwaiter" },
  { type: "use", item: "crank", target: "dumbwaiter" },
  { type: "take", item: "star" },
];

describe("The dining car and the finale", () => {
  const solo: RoomCtx = { hostId: "p1", onlineIds: ["p1"] };

  it("plays through to a correct accusation with every clue", () => {
    const { scene, results } = run([...ROOM_1, ...DINING, { type: "operate", target: "bell", op: "ring" }], initialScene(), solo);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(scene.flags).toContain("everyclue");
    const vote = applyAction(scene, { type: "vote", suspect: "varga" }, who, solo);
    expect(vote.finished).toBe(true);
    const dto = sceneDTO(vote.scene, { startedAt: new Date(Date.now() - 40 * 60000) });
    expect(dto.ending).toMatchObject({ accused: "varga", correct: true, everyClue: true, evidenceFound: 6, evidenceTotal: 6 });
    expect(dto.ending!.minutes).toBeGreaterThanOrEqual(39);
    // Nothing else can happen once the case is closed.
    expect(applyAction(vote.scene, { type: "operate", target: "lamp", op: "toggle" }, who, solo).ok).toBe(false);
  });

  it("won't open the cash box or call the conductor too early", () => {
    expect(applyAction(initialScene(), { type: "unlock", lock: "cashbox", input: "♦♠♣♥" }, who).ok).toBe(false);
    const { scene } = run(ROOM_1);
    expect(applyAction(scene, { type: "operate", target: "bell", op: "ring" }, who).ok).toBe(false);
    expect(applyAction(scene, { type: "use", item: "crank", target: "dumbwaiter" }, who).ok).toBe(false);
  });

  it("reveals the real name under the powder label only once peeled", () => {
    const { scene } = run([...ROOM_1, { type: "operate", target: "stole", op: "search" }, { type: "take", item: "powder" }]);
    const before = sceneDTO(scene).inventory.find((i) => i.id === "powder")!;
    expect(JSON.stringify(before)).not.toContain("Varga");
    expect(before.actions?.[0].op).toBe("peel");
    const after = sceneDTO(applyAction(scene, { type: "item", item: "powder", op: "peel" }, who).scene).inventory.find((i) => i.id === "powder")!;
    expect(after.reading!.lines).toContain("Countess I. Varga");
  });

  it("waits for everyone online, and hands a tie to the host", () => {
    const two: RoomCtx = { hostId: "p1", onlineIds: ["p1", "p2"] };
    const { scene } = run([...ROOM_1, ...DINING, { type: "operate", target: "bell", op: "ring" }], initialScene(), two);
    const a = applyAction(scene, { type: "vote", suspect: "carrow" }, who, two);
    expect(a.finished).toBeUndefined();
    const b = applyAction(a.scene, { type: "vote", suspect: "varga" }, { id: "p2", name: "Juno" }, two);
    expect(b.scene.vote?.tie).toEqual(["varga", "carrow"]);
    expect(applyAction(b.scene, { type: "tiebreak", suspect: "varga" }, { id: "p2", name: "Juno" }, two).ok).toBe(false);
    const c = applyAction(b.scene, { type: "tiebreak", suspect: "carrow" }, who, two);
    expect(c.finished).toBe(true);
    expect(sceneDTO(c.scene).ending).toMatchObject({ accused: "carrow", correct: false });
  });

  it("gives Teodor's notes one tier at a time, a minute apart, for the next unsolved puzzle", () => {
    const t0 = new Date("2026-01-01T00:00:00Z");
    const h1 = applyAction(initialScene(), { type: "hint" }, who, undefined, t0);
    expect(sceneDTO(h1.scene, { now: t0 }).hints[0]).toMatchObject({ puzzle: "suitcase", tier: 1 });
    expect(applyAction(h1.scene, { type: "hint" }, who, undefined, new Date(t0.getTime() + 10_000)).ok).toBe(false);
    const h2 = applyAction(h1.scene, { type: "hint" }, who, undefined, new Date(t0.getTime() + 61_000));
    expect(h2.scene.hints.map((h) => h.tier)).toEqual([1, 2]);
    // Hint text is only ever sent for notes already rung for.
    expect(JSON.stringify(sceneDTO(initialScene()))).not.toContain("2 4 7");
  });
});
