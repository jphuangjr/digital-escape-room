import { describe, expect, it } from "vitest";
import type { SceneAction } from "@/lib/train/types";
import { applyAction, initialScene, sceneDTO, type TrainScene } from "../scene";

const who = { id: "p1", name: "Sam" };
function run(actions: SceneAction[], start: TrainScene = initialScene()) {
  let s = start;
  const results = actions.map((a) => {
    const r = applyAction(s, a, who);
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
