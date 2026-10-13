import { describe, expect, it } from "vitest";
import type { AtlasSceneAction } from "@/lib/atlas/types";
import { applyAction, initialScene, sceneDTO, type AtlasScene } from "../scene";
import { DIAL_HOUR, LOCKS, PLAZA, traceBeam } from "../world";
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
];
const toMeridian = run([...ACT_ONE, { type: "dial", outer: "star", inner: "peak" }]).scene;
const tilt = (i: number): AtlasSceneAction => ({ type: "operate", target: "mirrors", op: `mirror:${i}` });

/** Every setting of the plaza mirrors (bit i set = mirror i leans "\"). */
const settings = Array.from({ length: 2 ** PLAZA.mirrors.length }, (_, n) => PLAZA.mirrors.map((_, i) => Boolean(n & (1 << i))));
const SOLUTION = settings.filter((b) => traceBeam(b).lit);

describe("the Sunken Meridian", () => {
  it("has exactly one way to light the sun door, and it uses every mirror", () => {
    expect(SOLUTION).toHaveLength(1);
    const path = traceBeam(SOLUTION[0]).path;
    for (const [x, y] of PLAZA.mirrors) expect(path).toContainEqual([x, y]);
    expect(traceBeam(PLAZA.mirrors.map(() => false)).lit).toBe(false); // it doesn't start solved
    // The last hint describes the same setting: columns 1 and 3 lean "\", column 2 leans "/".
    expect(SOLUTION[0]).toEqual(PLAZA.mirrors.map(([x]) => x !== 2));
    expect(en["hint.mirrors.3"]).toContain("second column like \\");
  });

  it("can be played from arrival to the seal", () => {
    const tilts = SOLUTION[0].flatMap((b, i) => (b ? [tilt(i)] : []));
    const { scene, results } = run(
      [
        ...tilts,
        { type: "take", item: "hand-mirror" },
        { type: "unlock", lock: "dial", input: "04" },
        { type: "take", item: "engineer-note" },
        { type: "take", item: "seal-sun" },
        { type: "take", item: "memory-meridian" },
      ],
      toMeridian,
    );
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([]);
    expect(scene.flags).toEqual(expect.arrayContaining(["meridian.lit", "meridian.chest.open"]));
    const dto = sceneDTO(scene);
    expect(dto.places.find((p) => p.id === "sanctum")?.reachable).toBe(true);
    expect(dto.log.map((l) => l.text)).toContain("Sam turned the mirrors and lit the sun door");
    // With the hand mirror, the engineer's note reads the right way round and states the rule.
    const note = dto.inventory.find((i) => i.id === "engineer-note")?.reading;
    expect(note?.lines.join(" ")).toContain("The outer ring is geared double");
  });

  it("keeps the temple shut until the light reaches the door, and the mirrors lock once it does", () => {
    expect(sceneDTO(toMeridian).closeups.chest).toBeUndefined();
    expect(applyAction(toMeridian, { type: "unlock", lock: "dial", input: "04" }, who).ok).toBe(false);
    const lit = run(SOLUTION[0].flatMap((b, i) => (b ? [tilt(i)] : [])), toMeridian).scene;
    expect(sceneDTO(lit).closeups.mirrors?.mirrors?.lit).toBe(true);
    expect(applyAction(lit, tilt(0), who).ok).toBe(false);
  });

  it("shows the beam's path as the mirrors turn", () => {
    const dto = sceneDTO(run([tilt(0)], toMeridian).scene);
    expect(dto.closeups.mirrors?.mirrors?.path.slice(0, 3)).toEqual([[0, 0], [1, 0], [1, 1]]);
  });

  it("opens the chest at the true hour, not where the mirror shows it or how IV reads reversed", () => {
    expect(LOCKS.dial.answers).toEqual([`0${DIAL_HOUR}`]);
    const lit = run(SOLUTION[0].flatMap((b, i) => (b ? [tilt(i)] : [])), toMeridian).scene;
    for (const decoy of ["08", "06"]) expect(applyAction(lit, { type: "unlock", lock: "dial", input: decoy }, who).ok).toBe(false);
  });

  it("writes the engineer's note backwards until the hand mirror is held", () => {
    const lit = run([...SOLUTION[0].flatMap((b, i) => (b ? [tilt(i)] : [])), { type: "unlock", lock: "dial", input: "04" }, { type: "take", item: "engineer-note" }], toMeridian).scene;
    const backwards = sceneDTO(lit).inventory.find((i) => i.id === "engineer-note")?.reading;
    expect(backwards?.lines.join(" ")).not.toContain("geared double");
    expect(backwards?.lines.join(" ")).toContain("elbuod deraeg");
  });

  it("lights the sunken vault only with the lens from the Verdant Archive (the optional secret)", () => {
    expect(applyAction(toMeridian, { type: "use", item: "sun-lens", target: "vault" }, who).ok).toBe(false); // not held
    const withLens = run([{ type: "dial", outer: "sun", inner: "wave" }, { type: "take", item: "sun-lens" }], toMeridian).scene;
    const { scene, results } = run([{ type: "use", item: "sun-lens", target: "vault" }, { type: "take", item: "star-map" }], withLens);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(scene.inventory).toContain("star-map");
  });

  it("gives the notes for the plaza, then the temple", () => {
    expect(applyAction(toMeridian, { type: "hint", where: "meridian" }, who, undefined, t0).scene.hints[0].puzzle).toBe("mirrors");
  });
});
