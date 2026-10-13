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
} from "@/lib/scene/types";

export const ATLAS_GAME_ID = "atlas-silent-worlds";

/** Places a player can stand. Personal (each player's own), but only reachable once the team opens the way. */
export type LocationId = "observatory" | "waterworks" | "chamber" | "verdant" | "meridian" | "pelagic";
export const LOCATIONS: LocationId[] = ["observatory", "waterworks", "chamber", "verdant", "meridian", "pelagic"];

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
  | "meridian-arrival"
  | "pelagic-arrival";

export const WALLS: Record<LocationId, WallId[]> = {
  observatory: ["telescope", "desk", "clock", "stairs"],
  waterworks: ["valves", "tunnel", "wheel"],
  chamber: ["gate", "engine"],
  verdant: ["verdant-arrival"],
  meridian: ["meridian-arrival"],
  pelagic: ["pelagic-arrival"],
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
  "meridian-gate": "meridian-arrival",
  "pelagic-gate": "pelagic-arrival",
} as const satisfies Record<string, WallId>;
export type HotspotId = keyof typeof HOTSPOT_WALL;

export type ItemId = "token" | "gear";
export type LockId = "clock" | "engine";
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
  | { kind: "glyph"; caption: string; glyph: GlyphId };

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
  /** This close-up has the Threshold rings (the gate). */
  gate?: { powered: boolean; jammedUntil?: string };
}

export type AtlasItemDTO = SceneItemDTO<ItemId>;

export interface PlaceDTO {
  id: LocationId;
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
}

export type AtlasSceneAction =
  | { type: "take"; item: ItemId }
  | { type: "operate"; target: HotspotId; op: string }
  | { type: "use"; item: ItemId; target: HotspotId }
  | { type: "unlock"; lock: LockId; input: string }
  | { type: "dial"; outer: GlyphId; inner: GlyphId }
  | { type: "hint"; where: LocationId };

export interface AtlasActionResponse extends SceneActionResponseOf<AtlasSceneDTO> {
  /** Set when a gate crossing succeeds: where the player who dialled now stands. */
  arrived?: LocationId;
}
