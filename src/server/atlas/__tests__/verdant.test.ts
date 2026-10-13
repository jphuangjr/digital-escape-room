import { describe, expect, it } from "vitest";
import type { AtlasSceneAction } from "@/lib/atlas/types";
import { GLYPHS } from "@/lib/atlas/types";
import { applyAction, initialScene, sceneDTO, type AtlasScene } from "../scene";
import { GLYPH_VALUE } from "../router";
import { LOCKS, ROOTS, ROOTS_ANSWER, rootEnd } from "../world";
import en from "../text/en";

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

const ACT_ONE: AtlasSceneAction[] = [
  { type: "unlock", lock: "clock", input: "0435" },
  { type: "take", item: "token" },
  { type: "use", item: "token", target: "stair-door" },
  ...["intake", "reservoir", "reservoir", "outflow", "intake"].map((op) => ({ type: "operate", target: "valves", op }) as AtlasSceneAction),
  { type: "take", item: "gear" },
  { type: "use", item: "gear", target: "engine" },
  { type: "unlock", lock: "engine", input: "✶≈◈" },
  { type: "dial", outer: "sun", inner: "wave" },
];
const inVerdant = run(ACT_ONE).scene;
const water = (pot: string): AtlasSceneAction => ({ type: "operate", target: "roots", op: `water:${pot}` });
const char = (id: string) => GLYPHS.find((g) => g.id === id)!.char;

describe("the Verdant Archive", () => {
  it("can be played from arrival to the seal", () => {
    const { scene, results } = run(
      [
        { type: "unlock", lock: "index", input: "☾◈≈☉⌘✶△" },
        { type: "take", item: "numerals" },
        { type: "take", item: "can" },
        water(ROOTS_ANSWER),
        { type: "take", item: "seal-leaf" },
        { type: "take", item: "memory-verdant" },
      ],
      inVerdant,
    );
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([]);
    expect(scene.flags).toEqual(expect.arrayContaining(["verdant.index.open", "verdant.door.open"]));
    expect(scene.inventory).toEqual(["numerals", "seal-leaf", "memory-verdant"]); // the can is used up
    const dto = sceneDTO(scene);
    expect(dto.log.map((l) => l.text)).toContain("Sam watered the right pot, and the roots opened the little door");
    expect(dto.inventory.find((i) => i.id === "memory-verdant")?.reading?.title).toBe("From Ilse Varro, archivist");
  });

  it("is out of reach until someone crosses into it", () => {
    expect(applyAction(initialScene(), { type: "unlock", lock: "index", input: "☾◈≈☉⌘✶△" }, who).ok).toBe(false);
    expect(sceneDTO(initialScene()).closeups.cabinet).toBeUndefined();
  });

  it("has exactly one pot whose root reaches the door, and the last hint names it", () => {
    const ends = ROOTS.pots.map((_, i) => rootEnd(i));
    expect([...ends].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]); // every root ends somewhere different
    expect(ends.filter((e) => e === ROOTS.door)).toHaveLength(1);
    expect(ROOTS_ANSWER).toBe("moon");
    expect(en["hint.roots.3"]).toContain(char(ROOTS_ANSWER));
    // No graft shares a root with another at the same depth, so the drawing is unambiguous.
    for (const [row, left] of ROOTS.grafts) {
      expect(ROOTS.grafts.filter(([r, l]) => r === row && Math.abs(l - left) <= 1)).toHaveLength(1);
    }
  });

  it("orders the index lock by the glyphs' real values, as the creeper and fern teach", () => {
    const byValue = [...GLYPHS].sort((a, b) => GLYPH_VALUE[a.id] - GLYPH_VALUE[b.id]).map((g) => g.char).join("");
    expect(LOCKS.index.answers).toEqual([byValue]);
    const creeper = en["c.creeper.note"].split("\n").filter((l) => /^Day \d: .$/u.test(l)).map((l) => GLYPH_VALUE[GLYPHS.find((g) => g.char === l.slice(-1))!.id]);
    expect(creeper).toEqual([0, 1, 1, 2, 3, 5]);
    const fern = en["c.fern.note"].split("\n").filter((l) => /^Day \d: .$/u.test(l)).map((l) => GLYPH_VALUE[GLYPHS.find((g) => g.char === l.slice(-1))!.id]);
    expect(fern).toEqual([1, 2, 4]);
  });

  it("needs the can, and soaks the soil after three wrong pots", () => {
    expect(applyAction(inVerdant, water(ROOTS_ANSWER), who).message).toBe(en["msg.needCan"]);
    const withCan = run([{ type: "unlock", lock: "index", input: "☾◈≈☉⌘✶△" }, { type: "take", item: "can" }], inVerdant).scene;
    expect(sceneDTO(withCan).closeups.roots?.actions).toHaveLength(7);
    const wrongs = ROOTS.pots.filter((p) => p !== ROOTS_ANSWER).slice(0, 3);
    const { scene, results } = run(wrongs.map(water), withCan);
    expect(results.map((r) => r.attempt)).toEqual(wrongs.map((p) => ({ lock: "roots", input: p, correct: false })));
    expect(applyAction(scene, water(ROOTS_ANSWER), who, undefined, new Date(t0.getTime() + 30_000)).ok).toBe(false);
    expect(applyAction(scene, water(ROOTS_ANSWER), who, undefined, new Date(t0.getTime() + 61_000)).ok).toBe(true);
  });

  it("only shows the glyph values once the numeral card is held", () => {
    const opened = run([{ type: "unlock", lock: "index", input: "☾◈≈☉⌘✶△" }], inVerdant).scene;
    expect(JSON.stringify(sceneDTO(opened))).not.toContain("☾ = 0");
    const held = run([{ type: "take", item: "numerals" }], opened).scene;
    expect(sceneDTO(held).inventory[0].reading?.lines).toEqual(["☾ = 0", "◈ = 1", "≈ = 2", "☉ = 3", "⌘ = 4", "✶ = 5", "△ = 6"]);
  });

  it("gives the Cartographer's notes for the Archive while you stand in it", () => {
    const r = applyAction(inVerdant, { type: "hint", where: "verdant" }, who, undefined, t0);
    expect(r.scene.hints[0].puzzle).toBe("index");
  });
});
