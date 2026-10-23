// The Atlas of Silent Worlds: contracts between server and client. Nothing here may contain answers:
// glyph values, lock codes and the node registry live in src/server/atlas. Plan: docs/ATLAS.md.
import type {
  CloseupAction,
  HintNote,
  NextHintDTO,
  SceneActionResponseOf,
  SceneItemDTO,
  SceneLockDTO,
  SceneLogEntry,
  SceneVoteDTO,
} from "@/lib/scene/types";

export const ATLAS_GAME_ID = "atlas-silent-worlds";

/** Places a player can stand. Personal (each player's own), but only reachable once the team opens the way. */
export type LocationId =
  | "observatory"
  | "waterworks"
  | "chamber"
  | "verdant"
  | "meridian"
  | "sanctum"
  | "pelagic"
  | "archive"
  | "cathedral";
export const LOCATIONS: LocationId[] = ["observatory", "waterworks", "chamber", "verdant", "meridian", "sanctum", "pelagic", "archive", "cathedral"];

/** The three Ages, whose gates the Atlas Core can reroute. */
export type AgeId = "verdant" | "meridian" | "pelagic";
export const AGES: AgeId[] = ["verdant", "meridian", "pelagic"];

/** How the game can end: the room votes. Reroute is offered only once the Core has been rerouted. */
export type AtlasEnding = "restore" | "sever" | "reroute";
export const ATLAS_ENDINGS: AtlasEnding[] = ["restore", "sever", "reroute"];

/** Every wall, in turning order per place (right turns go forward). */
export type WallId =
  | "telescope"
  | "desk"
  | "clock"
  | "stairs"
  | "valves"
  | "tunnel"
  | "wheel"
  | "gate"
  | "engine"
  | "verdant-arrival"
  | "verdant-beds"
  | "verdant-shelves"
  | "verdant-roots"
  | "meridian-arrival"
  | "meridian-plaza"
  | "sanctum-mirror"
  | "sanctum-study"
  | "pelagic-arrival"
  | "pelagic-airlock"
  | "archive-hall"
  | "archive-registry"
  | "cathedral-nave"
  | "cathedral-door";

export const WALLS: Record<LocationId, WallId[]> = {
  observatory: ["telescope", "desk", "clock", "stairs"],
  waterworks: ["valves", "tunnel", "wheel"],
  chamber: ["gate", "engine"],
  verdant: ["verdant-arrival", "verdant-beds", "verdant-shelves", "verdant-roots"],
  meridian: ["meridian-arrival", "meridian-plaza"],
  sanctum: ["sanctum-mirror", "sanctum-study"],
  pelagic: ["pelagic-arrival", "pelagic-airlock"],
  archive: ["archive-hall", "archive-registry"],
  cathedral: ["cathedral-nave", "cathedral-door"],
};

/** Things you can tap, and the wall each one is on. */
export const HOTSPOT_WALL = {
  "telescope": "telescope",
  "window": "telescope",
  "journal": "desk",
  "starchart": "desk",
  "clock": "clock",
  "plate": "stairs",
  "stair-door": "stairs",
  "valves": "valves",
  "schematic": "valves",
  "tunnel": "tunnel",
  "wheel": "wheel",
  "gate": "gate",
  "ledger": "gate",
  "engine": "engine",
  "engine-plaque": "engine",
  "verdant-gate": "verdant-arrival",
  "creeper": "verdant-beds",
  "fern": "verdant-beds",
  "cabinet": "verdant-shelves",
  "pot-sign": "verdant-shelves",
  "roots": "verdant-roots",
  "root-door": "verdant-roots",
  "meridian-gate": "meridian-arrival",
  "mirrors": "meridian-plaza",
  "sun-door": "meridian-plaza",
  "vault": "meridian-plaza",
  "great-mirror": "sanctum-mirror",
  "tablet": "sanctum-mirror",
  "chest": "sanctum-study",
  "altar": "sanctum-study",
  "pelagic-gate": "pelagic-arrival",
  "tanks": "pelagic-airlock",
  "airlock": "pelagic-airlock",
  "statues": "archive-hall",
  "lamps": "archive-hall",
  "gauge": "archive-hall",
  "glass": "archive-hall",
  "book-varro": "archive-registry",
  "book-ashe": "archive-registry",
  "book-halloran": "archive-registry",
  "desk": "archive-registry",
  "seed": "verdant-beds",
  "core": "cathedral-nave",
  "lectern": "cathedral-door",
  "cathedral-gate": "cathedral-door",
} as const satisfies Record<string, WallId>;
export type HotspotId = keyof typeof HOTSPOT_WALL;

export type ItemId =
  | "token"
  | "gear"
  | "numerals"
  | "can"
  | "seal-leaf"
  | "memory-verdant"
  | "sun-lens"
  | "hand-mirror"
  | "engineer-note"
  | "seal-sun"
  | "memory-meridian"
  | "star-map"
  | "brine"
  | "seal-tide"
  | "memory-pelagic"
  | "tide-chart"
  | "night-bloom";
export type LockId = "clock" | "engine" | "index" | "dial" | "registry";
export type ValveId = "intake" | "reservoir" | "outflow";
export const VALVES: ValveId[] = ["intake", "reservoir", "outflow"];

/**
 * The Cartographers' seven glyphs, in the order they're engraved around each gate ring. What each one is
 * worth is a puzzle (the Verdant Archive), so the server only ever talks about them by id.
 */
export type GlyphId = "sun" | "moon" | "star" | "eye" | "peak" | "wave" | "knot";
export const GLYPHS: { id: GlyphId; char: string }[] = [
  { id: "sun", char: "☉" },
  { id: "moon", char: "☾" },
  { id: "star", char: "✶" },
  { id: "eye", char: "◈" },
  { id: "peak", char: "△" },
  { id: "wave", char: "≈" },
  { id: "knot", char: "⌘" },
];
export const glyphChar = (id: GlyphId) => GLYPHS.find((g) => g.id === id)!.char;

/** One of the twelve constellations on the star chart, drawn as a little pattern of stars. */
export interface ChartStar {
  /** Clock position, 1–12. */
  at: number;
  shape: "line" | "ring" | "triangle" | "square" | "cross" | "single";
  stars: number;
}

/** A styled read-out in a close-up. */
export type AtlasDoc =
  | { kind: "note"; lines: string[] }
  | { kind: "plaque"; lines: string[] }
  | { kind: "starchart"; title: string; stars: ChartStar[] }
  | { kind: "ledger"; title: string; rows: { name: string; outer: GlyphId; inner: GlyphId }[]; torn: string }
  | { kind: "glyph"; caption: string; glyph: GlyphId }
  /** A ladder of roots: follow each pot's root down; where two roots are grafted, cross over. */
  | { kind: "roots"; caption: string; pots: GlyphId[]; grafts: [row: number, left: number][]; rows: number; door: number }
  /** A sundial seen only in a mirror: drawn left-right reversed, numerals and all. */
  | { kind: "mirrordial"; caption: string; hour: number };

/**
 * The Meridian plaza's mirrors: sunlight enters from the left on row 0 heading right; each mirror leans one of
 * two ways ("/" or "\"); pillars stop the light. `path` is the cells the beam crosses now.
 */
export interface MirrorGridDTO {
  w: number;
  h: number;
  mirrors: { x: number; y: number; back: boolean }[];
  pillars: [number, number][];
  /** The sun door's column, below the bottom row. */
  door: number;
  path: [number, number][];
  lit: boolean;
}

/** A close-up action. `go:<place>` actions move only the player who taps them and never reach the server. */
export type AtlasAction = CloseupAction;

export interface AtlasCloseupDTO {
  title: string;
  lines: string[];
  doc?: AtlasDoc;
  actions: AtlasAction[];
  /** Items lying here that can be picked up. */
  takes: AtlasItemDTO[];
  lock?: SceneLockDTO<LockId>;
  /** The three valves and whether each is open (Waterworks). */
  valves?: Record<ValveId, boolean>;
  /** The plaza mirrors (Sunken Meridian). */
  mirrors?: MirrorGridDTO;
  /** The Observatory plate's seven sockets and the seal seated in each, if any. */
  plate?: { sockets: { glyph: GlyphId; seal: ItemId | null }[]; registered: boolean; jammedUntil?: string; left?: number };
  /** The Atlas Core: whether the team may reroute the Ages (all three secrets found), and each Age gate's number. */
  core?: { canReroute: boolean; rerouted: boolean; gates: { age: AgeId; name: string; origin: number }[]; jammedUntil?: string; left?: number; convened: boolean };
  /** The Pelagic airlock's three tanks: capacities and current levels (big, pressure, small). */
  tanks?: { caps: number[]; levels: number[]; balanced: boolean };
  /** This close-up has the Threshold rings (the gate). */
  gate?: { powered: boolean; jammedUntil?: string; left?: number };
}

export type AtlasItemDTO = SceneItemDTO<ItemId>;

export interface PlaceDTO {
  id: LocationId;
  /** Empty until the team can stand there. */
  name: string;
  reachable: boolean;
}

export interface AtlasSceneDTO {
  flags: string[];
  inventory: AtlasItemDTO[];
  closeups: Partial<Record<HotspotId, AtlasCloseupDTO>>;
  log: SceneLogEntry[];
  hints: HintNote[];
  /** What the Cartographer's next note would help with, for a player standing in each place. */
  nextHints: Partial<Record<LocationId, NextHintDTO | null>>;
  places: PlaceDTO[];
  vote: AtlasVoteDTO | null;
  ending: AtlasEndingDTO | null;
}

export interface AtlasVoteDTO extends SceneVoteDTO<AtlasEnding> {
  /** The endings on offer, with their words (Reroute only once the Core has been rerouted). */
  choices: { id: AtlasEnding; name: string; line: string }[];
}

export interface AtlasEndingDTO {
  choice: AtlasEnding;
  title: string;
  paragraphs: string[];
  counts: Record<AtlasEnding, number>;
  secretsFound: number;
  secretsTotal: number;
  minutes: number;
}

export type AtlasSceneAction =
  | { type: "take"; item: ItemId }
  | { type: "operate"; target: HotspotId; op: string }
  | { type: "use"; item: ItemId; target: HotspotId }
  | { type: "unlock"; lock: LockId; input: string }
  | { type: "dial"; outer: GlyphId; inner: GlyphId }
  | { type: "hint"; where: LocationId }
  /** Seat a routing seal in one of the Observatory plate's sockets. */
  | { type: "seat"; seal: ItemId; socket: GlyphId }
  /** Set every Age's gate so it routes only to the Observatory. */
  | { type: "reroute"; rings: Record<AgeId, { outer: GlyphId; inner: GlyphId }> }
  | { type: "vote"; choice: AtlasEnding }
  | { type: "close-vote" }
  | { type: "tiebreak"; choice: AtlasEnding };

export interface AtlasActionResponse extends SceneActionResponseOf<AtlasSceneDTO> {
  /** Set when a gate crossing succeeds: where the player who dialled now stands. */
  arrived?: LocationId;
}
