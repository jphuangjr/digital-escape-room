import "server-only";
import type { AgeId, AtlasDoc, ChartStar, GlyphId, HotspotId, ItemId, LocationId, LockId } from "@/lib/atlas/types";
import { HOTSPOT_WALL, WALLS } from "@/lib/atlas/types";
import type { AtlasTextKey } from "./text";

// The world as data: where every hotspot is, what it says in each state, what you can do there, what lies
// there to pick up and what each lock wants. Puzzles that data can't express (the valves, the gate) are
// handled in ./scene.ts. State is a set of flags, e.g. "clock.set", "water.drained".

/** A condition on the room's flags: every `all` flag set and no `none` flag set. */
export interface Cond {
  all?: string[];
  none?: string[];
}
export const holds = (c: Cond | undefined, has: (f: string) => boolean) =>
  !c || ((c.all ?? []).every(has) && !(c.none ?? []).some(has));

/** Which place each wall belongs to. */
export const WALL_PLACE = Object.fromEntries(
  (Object.entries(WALLS) as [LocationId, string[]][]).flatMap(([place, walls]) => walls.map((w) => [w, place])),
) as Record<string, LocationId>;
export const hotspotPlace = (h: HotspotId): LocationId => WALL_PLACE[HOTSPOT_WALL[h]];

/** What the team must have done before anyone can stand in a place. */
export const PLACE_NEEDS: Record<LocationId, Cond> = {
  observatory: {},
  waterworks: { all: ["stairs.open"] },
  chamber: { all: ["water.drained"] },
  verdant: { all: ["reached.verdant"] },
  meridian: { all: ["reached.meridian"] },
  sanctum: { all: ["reached.meridian", "meridian.lit"] },
  pelagic: { all: ["reached.pelagic"] },
  archive: { all: ["reached.pelagic", "pelagic.airlock.open"] },
  cathedral: { all: ["reached.cathedral"] },
};

export interface ActionDef {
  op: string;
  label: AtlasTextKey;
  when?: Cond;
}

export interface HotspotDef {
  title: AtlasTextKey;
  /** The first entry whose condition holds gives the description (one line per "\n"). */
  text: { when?: Cond; key: AtlasTextKey }[];
  doc?: { when?: Cond; doc: DocDef };
  actions?: ActionDef[];
}

/** A doc to render, with text keys still to translate. */
export type DocDef =
  | { kind: "note" | "plaque"; key: AtlasTextKey }
  | { kind: "starchart"; title: AtlasTextKey }
  | { kind: "ledger"; title: AtlasTextKey; torn: AtlasTextKey }
  | { kind: "glyph"; caption: AtlasTextKey; glyph: GlyphId }
  | { kind: "roots"; caption: AtlasTextKey }
  | { kind: "mirrordial"; caption: AtlasTextKey; hour: number };

/** Clock positions on the star chart. The Lantern (a ring of six) is at 4 and the Key (three in a line) at 7. */
export const STAR_CHART: ChartStar[] = [
  { at: 1, shape: "square", stars: 4 },
  { at: 2, shape: "line", stars: 2 },
  { at: 3, shape: "cross", stars: 5 },
  { at: 4, shape: "ring", stars: 6 },
  { at: 5, shape: "triangle", stars: 3 },
  { at: 6, shape: "single", stars: 1 },
  { at: 7, shape: "line", stars: 3 },
  { at: 8, shape: "ring", stars: 5 },
  { at: 9, shape: "line", stars: 4 },
  { at: 10, shape: "line", stars: 5 },
  { at: 11, shape: "ring", stars: 7 },
  { at: 12, shape: "triangle", stars: 3 },
];

/** The routing ledger in the Threshold Chamber: settings from the Observatory gate (origin 0). */
export const LEDGER: { place: LocationId; outer: GlyphId; inner: GlyphId }[] = [
  { place: "verdant", outer: "sun", inner: "wave" },
  { place: "meridian", outer: "star", inner: "peak" },
  { place: "pelagic", outer: "knot", inner: "wave" },
];

/**
 * The Verdant Archive's root ladder: seven pots across the top (in ring order), grafts as [row, left column]
 * joining a root to its right-hand neighbour. Follow a root down, crossing at every graft; exactly one pot
 * reaches the little door. The answer is derived from the drawing, never written down separately.
 */
export const ROOTS = {
  pots: ["sun", "moon", "star", "eye", "peak", "wave", "knot"] as GlyphId[],
  grafts: [
    [0, 1], [0, 4], [1, 2], [1, 5], [2, 0], [2, 3], [3, 4], [3, 1], [4, 2],
    [4, 5], [5, 3], [5, 0], [6, 4], [6, 1], [7, 2], [7, 5], [8, 3], [8, 0],
  ] as [number, number][],
  rows: 9,
  door: 5,
};

/** Which column a root starting at `col` ends in. */
export function rootEnd(col: number, grafts: [number, number][] = ROOTS.grafts, rows = ROOTS.rows): number {
  let c = col;
  for (let r = 0; r < rows; r++) {
    const g = grafts.find(([row, left]) => row === r && (left === c || left + 1 === c));
    if (g) c = g[1] === c ? c + 1 : c - 1;
  }
  return c;
}

/** The pot whose root reaches the door. */
export const ROOTS_ANSWER: GlyphId = ROOTS.pots.find((_, i) => rootEnd(i) === ROOTS.door)!;

/**
 * The Meridian's mirror plaza: a 5×5 floor. Sunlight enters on row 0 from the west heading east; a "/" mirror
 * turns east→north, north→east, west→south, south→west; "\" turns east→south, south→east, west→north,
 * north→west; pillars stop the light. The sun door is below the bottom row in column `door`. Every mirror starts
 * as "/"; exactly one setting of the five lands the light on the door (checked in the tests).
 */
export const PLAZA = {
  w: 5,
  h: 5,
  mirrors: [
    [1, 0],
    [1, 4],
    [2, 4],
    [2, 2],
    [3, 2],
  ] as [number, number][],
  pillars: [
    [0, 4],
    [2, 1],
  ] as [number, number][],
  door: 3,
};

/** The cells the light crosses for a setting (`back[i]`: mirror i leans "\"), and whether it reaches the door. */
export function traceBeam(back: boolean[], plaza = PLAZA): { path: [number, number][]; lit: boolean } {
  const step: Record<string, [number, number]> = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] };
  const slash: Record<string, string> = { E: "N", N: "E", W: "S", S: "W" };
  const backslash: Record<string, string> = { E: "S", S: "E", W: "N", N: "W" };
  let [x, y, d] = [-1, 0, "E"];
  const path: [number, number][] = [];
  for (let i = 0; i < 4 * plaza.w * plaza.h; i++) {
    x += step[d][0];
    y += step[d][1];
    if (x < 0 || y < 0 || x >= plaza.w || y >= plaza.h) return { path, lit: y === plaza.h && x === plaza.door };
    if (plaza.pillars.some(([px, py]) => px === x && py === y)) return { path, lit: false };
    path.push([x, y]);
    const m = plaza.mirrors.findIndex(([mx, my]) => mx === x && my === y);
    if (m >= 0) d = (back[m] ? backslash : slash)[d];
  }
  return { path, lit: false };
}

/**
 * The Pelagic airlock's tanks: big, pressure, small. Pour until one is empty or the other full; the airlock opens
 * when the pressure tank holds exactly `target`. Starts with the big tank full (shortest solution: six pours).
 */
export const TANKS = { caps: [8, 5, 3], start: [8, 0, 0], pressure: 1, target: 4 };

/** Pour tank `from` into tank `to`: as much as fits. */
export function pour(levels: number[], from: number, to: number, caps = TANKS.caps): number[] {
  const moved = Math.min(levels[from], caps[to] - levels[to]);
  return levels.map((l, i) => (i === from ? l - moved : i === to ? l + moved : l));
}

/**
 * Act III. Each routing seal goes in the plate socket of its own Age's node (Halloran's registry: Verdant ◈,
 * Meridian ≈, Pelagic ☉); all three seated restores the Cathedral's registration.
 */
export const SEAL_SOCKETS: Partial<Record<ItemId, GlyphId>> = { "seal-leaf": "eye", "seal-sun": "wave", "seal-tide": "sun" };
export const SEALS = Object.keys(SEAL_SOCKETS) as ItemId[];

/** The three optional cross-Age secrets: all three let the Core reroute the Ages (the third ending). */
export const SECRETS: ItemId[] = ["star-map", "tide-chart", "night-bloom"];

/** Which Age each seal belongs to (for the plate's log line). */
export const SEAL_AGE: Record<string, AgeId> = { "seal-leaf": "verdant", "seal-sun": "meridian", "seal-tide": "pelagic" };

/** The hour the buried sundial's shadow really falls on (the great mirror shows it reversed, at 8). */
export const DIAL_HOUR = 4;

const ageHome: ActionDef[] = [{ op: "go:chamber", label: "c.age.home" }];

export const HOTSPOTS: Record<HotspotId, HotspotDef> = {
  // the Observatory
  telescope: {
    title: "c.telescope.title",
    text: [{ key: "c.telescope.text" }],
    doc: { doc: { kind: "glyph", caption: "c.telescope.glyph", glyph: "eye" } },
  },
  window: { title: "c.window.title", text: [{ key: "c.window.text" }] },
  journal: { title: "c.journal.title", text: [{ key: "c.journal.text" }], doc: { doc: { kind: "note", key: "c.journal.note" } } },
  starchart: { title: "c.starchart.title", text: [{ key: "c.starchart.text" }], doc: { doc: { kind: "starchart", title: "c.starchart.heading" } } },
  clock: {
    title: "c.clock.title",
    text: [{ when: { all: ["clock.set"] }, key: "c.clock.set" }, { key: "c.clock.text" }],
    doc: { when: { all: ["clock.set"] }, doc: { kind: "glyph", caption: "c.clock.glyph", glyph: "star" } },
  },
  plate: {
    title: "c.plate.title",
    text: [
      { when: { all: ["cathedral.registered"] }, key: "c.plate.registered" },
      { when: { all: ["plate.any"] }, key: "c.plate.seated" },
      { key: "c.plate.text" },
    ],
  },
  "stair-door": {
    title: "c.stair-door.title",
    text: [{ when: { all: ["stairs.open"] }, key: "c.stair-door.open" }, { key: "c.stair-door.text" }],
    actions: [{ op: "go:waterworks", label: "c.stair-door.go", when: { all: ["stairs.open"] } }],
  },
  // the Waterworks
  valves: { title: "c.valves.title", text: [{ when: { all: ["water.drained"] }, key: "c.valves.drained" }, { key: "c.valves.text" }] },
  schematic: { title: "c.schematic.title", text: [{ key: "c.schematic.text" }], doc: { doc: { kind: "plaque", key: "c.schematic.plaque" } } },
  tunnel: {
    title: "c.tunnel.title",
    text: [{ when: { all: ["water.drained"] }, key: "c.tunnel.drained" }, { key: "c.tunnel.text" }],
    actions: [{ op: "go:chamber", label: "c.tunnel.go", when: { all: ["water.drained"] } }],
  },
  wheel: {
    title: "c.wheel.title",
    text: [{ when: { all: ["water.drained"] }, key: "c.wheel.stopped" }, { key: "c.wheel.text" }],
    doc: { when: { all: ["water.drained"] }, doc: { kind: "glyph", caption: "c.wheel.glyph", glyph: "wave" } },
  },
  // the Threshold Chamber
  engine: {
    title: "c.engine.title",
    text: [
      { when: { all: ["engine.on"] }, key: "c.engine.on" },
      { when: { all: ["engine.geared"] }, key: "c.engine.geared" },
      { key: "c.engine.text" },
    ],
  },
  "engine-plaque": { title: "c.engine-plaque.title", text: [{ key: "c.engine-plaque.text" }], doc: { doc: { kind: "plaque", key: "c.engine-plaque.plaque" } } },
  gate: { title: "c.gate.title", text: [{ when: { all: ["engine.on"] }, key: "c.gate.powered" }, { key: "c.gate.text" }] },
  ledger: { title: "c.ledger.title", text: [{ key: "c.ledger.text" }], doc: { doc: { kind: "ledger", title: "c.ledger.heading", torn: "c.ledger.torn" } } },
  // the Ages, for now just somewhere to arrive
  "verdant-gate": { title: "c.verdant-gate.title", text: [{ key: "c.verdant-gate.text" }], actions: ageHome },
  "meridian-gate": { title: "c.meridian-gate.title", text: [{ key: "c.meridian-gate.text" }], actions: ageHome },
  creeper: { title: "c.creeper.title", text: [{ key: "c.creeper.text" }], doc: { doc: { kind: "note", key: "c.creeper.note" } } },
  fern: { title: "c.fern.title", text: [{ key: "c.fern.text" }], doc: { doc: { kind: "note", key: "c.fern.note" } } },
  cabinet: { title: "c.cabinet.title", text: [{ when: { all: ["verdant.index.open"] }, key: "c.cabinet.open" }, { key: "c.cabinet.text" }] },
  "pot-sign": { title: "c.pot-sign.title", text: [{ key: "c.pot-sign.text" }], doc: { doc: { kind: "plaque", key: "c.pot-sign.plaque" } } },
  // The water actions (one per pot) are added in ../scene.ts while the team holds the can.
  roots: { title: "c.roots.title", text: [{ key: "c.roots.text" }], doc: { doc: { kind: "roots", caption: "c.roots.caption" } } },
  "root-door": { title: "c.root-door.title", text: [{ when: { all: ["verdant.door.open"] }, key: "c.root-door.open" }, { key: "c.root-door.text" }] },
  mirrors: {
    title: "c.mirrors.title",
    text: [{ when: { all: ["meridian.lit"] }, key: "c.mirrors.lit" }, { key: "c.mirrors.text" }],
  },
  "sun-door": {
    title: "c.sun-door.title",
    text: [{ when: { all: ["meridian.lit"] }, key: "c.sun-door.lit" }, { key: "c.sun-door.text" }],
    actions: [{ op: "go:sanctum", label: "c.sun-door.go", when: { all: ["meridian.lit"] } }],
  },
  vault: { title: "c.vault.title", text: [{ when: { all: ["meridian.vault.lit"] }, key: "c.vault.lit" }, { key: "c.vault.text" }] },
  "great-mirror": {
    title: "c.great-mirror.title",
    text: [{ key: "c.great-mirror.text" }],
    doc: { doc: { kind: "mirrordial", caption: "c.great-mirror.caption", hour: DIAL_HOUR } },
    actions: [{ op: "go:meridian", label: "c.sanctum-home.go" }],
  },
  tablet: { title: "c.tablet.title", text: [{ key: "c.tablet.text" }], doc: { doc: { kind: "plaque", key: "c.tablet.plaque" } } },
  chest: { title: "c.chest.title", text: [{ when: { all: ["meridian.chest.open"] }, key: "c.chest.open" }, { key: "c.chest.text" }] },
  altar: { title: "c.altar.title", text: [{ key: "c.altar.text" }] },
  tanks: {
    title: "c.tanks.title",
    text: [{ when: { all: ["pelagic.airlock.open"] }, key: "c.tanks.balanced" }, { key: "c.tanks.text" }],
  },
  airlock: {
    title: "c.airlock.title",
    text: [{ when: { all: ["pelagic.airlock.open"] }, key: "c.airlock.open" }, { key: "c.airlock.text" }],
    actions: [{ op: "go:archive", label: "c.airlock.go", when: { all: ["pelagic.airlock.open"] } }],
  },
  statues: { title: "c.statues.title", text: [{ key: "c.statues.text" }], actions: [{ op: "go:pelagic", label: "c.archive-home.go" }] },
  lamps: { title: "c.lamps.title", text: [{ key: "c.lamps.text" }] },
  gauge: { title: "c.gauge.title", text: [{ key: "c.gauge.text" }] },
  glass: { title: "c.glass.title", text: [{ when: { all: ["pelagic.glass.read"] }, key: "c.glass.read" }, { key: "c.glass.text" }] },
  "book-varro": { title: "c.book-varro.title", text: [{ key: "c.book-varro.text" }], doc: { doc: { kind: "note", key: "c.book-varro.note" } } },
  "book-ashe": { title: "c.book-ashe.title", text: [{ key: "c.book-ashe.text" }], doc: { doc: { kind: "note", key: "c.book-ashe.note" } } },
  "book-halloran": { title: "c.book-halloran.title", text: [{ key: "c.book-halloran.text" }], doc: { doc: { kind: "note", key: "c.book-halloran.note" } } },
  desk: { title: "c.desk.title", text: [{ when: { all: ["pelagic.desk.open"] }, key: "c.desk.open" }, { key: "c.desk.text" }] },
  seed: { title: "c.seed.title", text: [{ when: { all: ["verdant.seed.bloomed"] }, key: "c.seed.bloomed" }, { key: "c.seed.text" }] },
  core: { title: "c.core.title", text: [{ when: { all: ["core.convened"] }, key: "c.core.convened" }, { key: "c.core.text" }] },
  lectern: { title: "c.lectern.title", text: [{ key: "c.lectern.text" }], doc: { doc: { kind: "note", key: "c.lectern.note" } } },
  "cathedral-gate": {
    title: "c.cathedral-gate.title",
    text: [{ key: "c.cathedral-gate.text" }],
    actions: [{ op: "go:chamber", label: "c.cathedral-gate.go" }],
  },
  "pelagic-gate": { title: "c.pelagic-gate.title", text: [{ key: "c.pelagic-gate.text" }], actions: ageHome },
};

/** Where each item lies, and what must be true before anyone can see it there. */
export const ITEM_PLACES: Record<ItemId, { at: HotspotId; when: Cond }> = {
  token: { at: "clock", when: { all: ["clock.set"] } },
  gear: { at: "tunnel", when: { all: ["water.drained"] } },
  numerals: { at: "cabinet", when: { all: ["verdant.index.open"] } },
  can: { at: "cabinet", when: { all: ["verdant.index.open"] } },
  "seal-leaf": { at: "root-door", when: { all: ["verdant.door.open"] } },
  "memory-verdant": { at: "root-door", when: { all: ["verdant.door.open"] } },
  // The Verdant lens is for the Meridian's vault: the optional secret that crosses between the two Ages.
  "sun-lens": { at: "verdant-gate", when: {} },
  "hand-mirror": { at: "altar", when: {} },
  "engineer-note": { at: "chest", when: { all: ["meridian.chest.open"] } },
  "seal-sun": { at: "chest", when: { all: ["meridian.chest.open"] } },
  "memory-meridian": { at: "chest", when: { all: ["meridian.chest.open"] } },
  "star-map": { at: "vault", when: { all: ["meridian.vault.lit"] } },
  brine: { at: "pelagic-gate", when: {} },
  "seal-tide": { at: "desk", when: { all: ["pelagic.desk.open"] } },
  "memory-pelagic": { at: "desk", when: { all: ["pelagic.desk.open"] } },
  // The other two cross-Age secrets: the Meridian's hand mirror reads the Library's glass, and the Library's sea
  // water wakes the Verdant seed.
  "tide-chart": { at: "glass", when: { all: ["pelagic.glass.read"] } },
  "night-bloom": { at: "seed", when: { all: ["verdant.seed.bloomed"] } },
};

/** Using an item on a hotspot. */
export interface UseDef {
  item: ItemId;
  target: HotspotId;
  when: Cond;
  sets: string[];
  consumes: boolean;
  message: AtlasTextKey;
  log: AtlasTextKey;
}
export const USES: UseDef[] = [
  { item: "token", target: "stair-door", when: { none: ["stairs.open"] }, sets: ["stairs.open"], consumes: true, message: "msg.stairs", log: "log.stairs" },
  { item: "gear", target: "engine", when: { none: ["engine.geared"] }, sets: ["engine.geared"], consumes: true, message: "msg.gear", log: "log.gear" },
  { item: "hand-mirror", target: "glass", when: { none: ["pelagic.glass.read"] }, sets: ["pelagic.glass.read"], consumes: false, message: "msg.glass", log: "log.glass" },
  { item: "brine", target: "seed", when: { none: ["verdant.seed.bloomed"] }, sets: ["verdant.seed.bloomed"], consumes: true, message: "msg.seed", log: "log.seed" },
  { item: "sun-lens", target: "vault", when: { none: ["meridian.vault.lit"] }, sets: ["meridian.vault.lit"], consumes: true, message: "msg.vault", log: "log.vault" },
];

/** A lock: where it is, when it can be tried, and what it opens. Codes never leave the server. */
export interface LockDef {
  at: HotspotId;
  kind: "digits" | "symbols";
  length: number;
  label: AtlasTextKey;
  when: Cond;
  /** Every accepted input (the clock reads the same at 04:35 and 16:35). */
  answers: string[];
  sets: string[];
  message: AtlasTextKey;
  log: AtlasTextKey;
}
export const LOCKS: Record<LockId, LockDef> = {
  clock: {
    at: "clock",
    kind: "digits",
    length: 4,
    label: "lock.clock",
    when: { none: ["clock.set"] },
    answers: ["0435", "1635"],
    sets: ["clock.set"],
    message: "msg.clock",
    log: "log.clock",
  },
  engine: {
    at: "engine",
    kind: "symbols",
    length: 3,
    label: "lock.engine",
    when: { all: ["engine.geared"], none: ["engine.on"] },
    answers: ["✶≈◈"],
    sets: ["engine.on"],
    message: "msg.engine",
    log: "log.engine",
  },
  // The glyphs in counting order: the creeper fixes ☾ ◈ ≈ ☉ ✶, the fern ⌘, and △ is what's left.
  index: {
    at: "cabinet",
    kind: "symbols",
    length: 7,
    label: "lock.index",
    when: { none: ["verdant.index.open"] },
    answers: ["☾◈≈☉⌘✶△"],
    sets: ["verdant.index.open"],
    message: "msg.index",
    log: "log.index",
  },
  // The hour the shadow really falls on; 08 is where the mirror shows it, 06 is how IV reads in a mirror.
  dial: {
    at: "chest",
    kind: "digits",
    length: 2,
    label: "lock.dial",
    when: { none: ["meridian.chest.open"] },
    answers: [String(DIAL_HOUR).padStart(2, "0")],
    sets: ["meridian.chest.open"],
    message: "msg.dial",
    log: "log.dial",
  },
  // Halloran's registry, the only one whose description of the hall matches it (four statues, green lamps,
  // twelve fathoms): Verdant, Meridian, Pelagic, and the struck node.
  registry: {
    at: "desk",
    kind: "symbols",
    length: 4,
    label: "lock.registry",
    when: { none: ["pelagic.desk.open"] },
    answers: ["◈≈☉△"],
    sets: ["pelagic.desk.open"],
    message: "msg.registry",
    log: "log.registry",
  },
};

/**
 * The Cartographer's notes (hints), per puzzle, and which puzzles belong to each place. A player asking for
 * help gets the first unsolved puzzle where they stand, else the first unsolved one anywhere. A puzzle with
 * `ready` isn't offered until that holds.
 */
export const HINT_PUZZLES: { id: string; place: LocationId; solved: Cond; ready?: Cond }[] = [
  { id: "clock", place: "observatory", solved: { all: ["clock.set"] } },
  { id: "stairs", place: "observatory", solved: { all: ["stairs.open"] } },
  { id: "valves", place: "waterworks", solved: { all: ["water.drained"] } },
  { id: "engine", place: "chamber", solved: { all: ["engine.on"] } },
  { id: "gate", place: "chamber", solved: { all: ["crossed"] } },
  { id: "index", place: "verdant", solved: { all: ["verdant.index.open"] } },
  { id: "roots", place: "verdant", solved: { all: ["verdant.door.open"] } },
  { id: "mirrors", place: "meridian", solved: { all: ["meridian.lit"] } },
  { id: "dial", place: "sanctum", solved: { all: ["meridian.chest.open"] } },
  { id: "tanks", place: "pelagic", solved: { all: ["pelagic.airlock.open"] } },
  { id: "registry", place: "archive", solved: { all: ["pelagic.desk.open"] } },
  // Act III's notes only come once they can be acted on: all three seals found, then the registration restored.
  { id: "plate", place: "observatory", solved: { all: ["cathedral.registered"] }, ready: { all: ["verdant.door.open", "meridian.chest.open", "pelagic.desk.open"] } },
  { id: "route", place: "chamber", solved: { all: ["reached.cathedral"] }, ready: { all: ["cathedral.registered"] } },
  { id: "core", place: "cathedral", solved: { all: ["core.convened"] } },
];
export const HINT_COOLDOWN_SEC = 60;

/** Translated docs: the glyph, chart and ledger data is shared; only the words vary. */
export function docFor(def: DocDef, T: (k: AtlasTextKey, v?: Record<string, string | number>) => string): AtlasDoc {
  switch (def.kind) {
    case "note":
    case "plaque":
      return { kind: def.kind, lines: T(def.key).split("\n") };
    case "starchart":
      return { kind: "starchart", title: T(def.title), stars: STAR_CHART };
    case "ledger":
      return {
        kind: "ledger",
        title: T(def.title),
        rows: LEDGER.map((r) => ({ name: T(`place.${r.place}`), outer: r.outer, inner: r.inner })),
        torn: T(def.torn),
      };
    case "glyph":
      return { kind: "glyph", caption: T(def.caption), glyph: def.glyph };
    case "mirrordial":
      return { kind: "mirrordial", caption: T(def.caption), hour: def.hour };
    case "roots":
      return { kind: "roots", caption: T(def.caption), pots: ROOTS.pots, grafts: ROOTS.grafts, rows: ROOTS.rows, door: ROOTS.door };
  }
}
