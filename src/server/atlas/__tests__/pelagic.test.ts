import { describe, expect, it } from "vitest";
import type { AtlasSceneAction } from "@/lib/atlas/types";
import { applyAction, initialScene, parseScene, sceneDTO, type AtlasScene } from "../scene";
import { LOCKS, pour, TANKS } from "../world";
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
const toPelagic = run([...ACT_ONE, { type: "dial", outer: "knot", inner: "wave" }]).scene;
const pourOp = (a: number, b: number): AtlasSceneAction => ({ type: "operate", target: "tanks", op: `pour:${a}:${b}` });
const SOLVE_TANKS = [pourOp(0, 1), pourOp(1, 2), pourOp(2, 0), pourOp(1, 2), pourOp(0, 1), pourOp(1, 2)];

/** Breadth-first search over tank states: the fewest pours that leave the target in the pressure tank. */
function shortestTanks(): number {
  const key = (l: number[]) => l.join(",");
  let frontier = [TANKS.start];
  const seen = new Set([key(TANKS.start)]);
  for (let depth = 0; frontier.length; depth++) {
    if (frontier.some((l) => l[TANKS.pressure] === TANKS.target)) return depth;
    const next: number[][] = [];
    for (const l of frontier)
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 3; b++) {
          if (a === b) continue;
          const n = pour(l, a, b);
          if (!seen.has(key(n))) {
            seen.add(key(n));
            next.push(n);
          }
        }
    frontier = next;
  }
  return -1;
}

describe("the Pelagic Library", () => {
  it("can be played from arrival to the seal", () => {
    const { scene, results } = run(
      [...SOLVE_TANKS, { type: "unlock", lock: "registry", input: "◈≈☉△" }, { type: "take", item: "seal-tide" }, { type: "take", item: "memory-pelagic" }],
      toPelagic,
    );
    expect(results.filter((r) => !r.ok).map((r) => r.message)).toEqual([]);
    expect(scene.tanks).toEqual([1, 4, 3]);
    expect(scene.flags).toEqual(expect.arrayContaining(["pelagic.airlock.open", "pelagic.desk.open"]));
    const dto = sceneDTO(scene);
    expect(dto.places.find((p) => p.id === "archive")?.reachable).toBe(true);
    expect(dto.inventory.find((i) => i.id === "memory-pelagic")?.reading?.title).toBe("From E. Halloran, engineer");
  });

  it("has a six-pour shortest solution, which is what the last hint spells out", () => {
    expect(shortestTanks()).toBe(6);
    expect(en["hint.tanks.3"].split(", ")).toHaveLength(6);
  });

  it("only pours what fits, refuses empty pours, and can be drained back to the start", () => {
    const { scene } = run([pourOp(0, 2), pourOp(2, 1)], toPelagic);
    expect(scene.tanks).toEqual([5, 3, 0]);
    expect(applyAction(toPelagic, pourOp(1, 0), who).ok).toBe(false); // the pressure tank is empty
    const reset = applyAction(scene, { type: "operate", target: "tanks", op: "reset" }, who).scene;
    expect(reset.tanks).toEqual(TANKS.start);
  });

  it("keeps the reading room shut until the tanks balance", () => {
    expect(sceneDTO(toPelagic).closeups.desk).toBeUndefined();
    expect(applyAction(toPelagic, { type: "unlock", lock: "registry", input: "◈≈☉△" }, who).ok).toBe(false);
  });

  it("trusts only the registry that describes the hall as it is", () => {
    const hall = { statues: "four statues", lamps: "green lamps", gauge: "twelve fathoms" };
    expect(en["c.statues.text"]).toContain("Four statues");
    expect(en["c.lamps.text"]).toContain("green glass lamps");
    expect(en["c.gauge.text"]).toContain("twelve fathoms");
    const matches = (["book-varro", "book-ashe", "book-halloran"] as const).filter((b) =>
      Object.values(hall).every((fact) => en[`c.${b}.note`].includes(fact)),
    );
    expect(matches).toEqual(["book-halloran"]);
    // The desk takes Halloran's row; the other two books' rows are wrong.
    const row = (b: "book-varro" | "book-ashe" | "book-halloran") => {
      const lines = en[`c.${b}.note`].split("\n");
      const routes = lines.find((l) => l.startsWith("From the Observatory"))!.match(/[☉☾✶◈△≈⌘]/gu)!;
      const struck = lines.find((l) => l.startsWith("Struck"))!.match(/[☉☾✶◈△≈⌘]/gu)!;
      return [...routes, ...struck].join("");
    };
    expect(LOCKS.registry.answers).toEqual([row("book-halloran")]);
    const opened = run(SOLVE_TANKS, toPelagic).scene;
    for (const decoy of [row("book-varro"), row("book-ashe")]) expect(applyAction(opened, { type: "unlock", lock: "registry", input: decoy }, who).ok).toBe(false);
  });

  it("reads the glass with the Meridian's hand mirror, and wakes the Verdant seed with its sea water (two optional secrets)", () => {
    const opened = run([...SOLVE_TANKS, { type: "take", item: "brine" }], toPelagic).scene;
    expect(applyAction(opened, { type: "use", item: "hand-mirror", target: "glass" }, who).ok).toBe(false); // no mirror yet
    // Fetch the hand mirror from the Sun Temple (light the plaza: columns 1 and 3 lean "\").
    const withMirror = run(
      [
        { type: "dial", outer: "star", inner: "peak" },
        ...[0, 1, 4].map((i) => ({ type: "operate", target: "mirrors", op: `mirror:${i}` }) as AtlasSceneAction),
        { type: "take", item: "hand-mirror" },
      ],
      opened,
    ).scene;
    const glass = run([{ type: "use", item: "hand-mirror", target: "glass" }, { type: "take", item: "tide-chart" }], withMirror);
    expect(glass.results.every((r) => r.ok)).toBe(true);
    expect(glass.scene.inventory).toEqual(expect.arrayContaining(["hand-mirror", "tide-chart"])); // the mirror is kept
    const seed = run([{ type: "dial", outer: "sun", inner: "wave" }, { type: "use", item: "brine", target: "seed" }, { type: "take", item: "night-bloom" }], glass.scene);
    expect(seed.results.every((r) => r.ok)).toBe(true);
    expect(seed.scene.inventory).toContain("night-bloom");
  });

  it("repairs impossible stored tank levels", () => {
    expect(parseScene({ tanks: [8, 5, 3] }).tanks).toEqual(TANKS.start); // more water than there is
    expect(parseScene({ tanks: [1, 4, 3] }).tanks).toEqual([1, 4, 3]);
    expect(parseScene({}).tanks).toEqual(TANKS.start);
  });
});
