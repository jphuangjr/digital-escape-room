import "server-only";
import type { AtlasDoc, ChartStar, GlyphId, HotspotId, ItemId, LocationId, LockId } from "@/lib/atlas/types";
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
  pelagic: { all: ["reached.pelagic"] },
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
  | { kind: "glyph"; caption: AtlasTextKey; glyph: GlyphId };

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
  plate: { title: "c.plate.title", text: [{ key: "c.plate.text" }] },
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
  "pelagic-gate": { title: "c.pelagic-gate.title", text: [{ key: "c.pelagic-gate.text" }], actions: ageHome },
};

/** Where each item lies, and what must be true before anyone can see it there. */
export const ITEM_PLACES: Record<ItemId, { at: HotspotId; when: Cond }> = {
  token: { at: "clock", when: { all: ["clock.set"] } },
  gear: { at: "tunnel", when: { all: ["water.drained"] } },
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
};

/**
 * The Cartographer's notes (hints), per puzzle, and which puzzles belong to each place. A player asking for
 * help gets the first unsolved puzzle where they stand, else the first unsolved one anywhere.
 */
export const HINT_PUZZLES: { id: string; place: LocationId; solved: Cond }[] = [
  { id: "clock", place: "observatory", solved: { all: ["clock.set"] } },
  { id: "stairs", place: "observatory", solved: { all: ["stairs.open"] } },
  { id: "valves", place: "waterworks", solved: { all: ["water.drained"] } },
  { id: "engine", place: "chamber", solved: { all: ["engine.on"] } },
  { id: "gate", place: "chamber", solved: { all: ["crossed"] } },
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
  }
}
