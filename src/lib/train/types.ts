// The Nightingale Express: contracts between server and client for physical-room games.
// Nothing here may contain answers; lock codes and code-revealing text live in src/server/train.
// Shapes common to every scene game live in src/lib/scene/types.ts.
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

export type { CloseupAction, HintNote, SceneLogEntry } from "@/lib/scene/types";

export const TRAIN_GAME_ID = "nightingale-express";

/** Where a player is looking. Personal (not shared): the corridor and dining car open once the door does. */
export type TrainRoomId = "12b" | "corridor" | "dining";

/** The four walls of each room, in turning order (right turns go forward). */
export type WallId = "window" | "door" | "berths" | "washstand" | "bar" | "tables" | "kitchen" | "lounge";
export const WALLS_12B: WallId[] = ["window", "door", "berths", "washstand"];
export const WALLS_DINING: WallId[] = ["bar", "tables", "kitchen", "lounge"];

/** Who the team can accuse in the finale. */
export type Suspect = "varga" | "carrow" | "osei" | "lindqvist";
export const SUSPECTS: Suspect[] = ["varga", "carrow", "osei", "lindqvist"];

/** Things you can tap on a wall. Their positions live with the art (src/components/train/walls). */
export type HotspotId =
  | "window"
  | "newspaper"
  | "teacup"
  | "door"
  | "coat"
  | "suitcase"
  | "pillow"
  | "under-berth"
  | "lamp"
  | "upper-berth"
  | "washstand"
  | "mirror"
  | "vent"
  | "towel"
  // the dining car
  | "bell"
  | "cashbox"
  | "bottles"
  | "bridge"
  | "sugar"
  | "champagne"
  | "menu"
  | "dumbwaiter"
  | "kitchen-door"
  | "gramophone"
  | "records"
  | "stole"
  | "dining-window"
  | "bar-card"
  // things to look at that have nothing to do with the case
  | "plaque"
  | "heater"
  | "hatbox"
  | "safety-card"
  | "umbrella"
  | "painting"
  | "carafe"
  | "toiletries"
  | "water-sign"
  | "shaker"
  | "stools"
  | "vase"
  | "porthole"
  | "crate"
  | "photo"
  | "palm";

export type ItemId =
  | "pouch"
  | "washstand-key"
  | "screwdriver"
  | "latchkey"
  | "telegram-left"
  | "telegram-blank"
  | "telegram-right"
  | "telegram"
  | "cufflink"
  | "scorecard"
  | "keyring"
  | "crank"
  | "powder"
  | "bank-notice"
  | "star";

export type LockId = "suitcase" | "door" | "cashbox";

/** Wheel faces on the cash box's symbol lock. */
export const SUIT_SYMBOLS = ["♠", "♥", "♦", "♣"];

export type ItemDTO = SceneItemDTO<ItemId>;

/** A styled read-out in a close-up: a newspaper page, a luggage tag, a fogged mirror. */
export type CloseupDoc =
  | { kind: "newspaper"; masthead: string; date: string; headline: string; column: string[]; timetableTitle: string; timetable: string[][]; notes: string[] }
  | { kind: "tag"; lines: string[] }
  | { kind: "note"; lines: string[] }
  | { kind: "mirror"; fogged: boolean; letters?: string }
  | { kind: "scorecard"; title: string; rows: string[][]; note: string }
  | { kind: "chalk"; title: string; lines: string[] }
  | { kind: "engraving"; text: string };

export interface CloseupDTO {
  title: string;
  lines: string[];
  doc?: CloseupDoc;
  actions: CloseupAction[];
  /** Items lying here that can be picked up. */
  takes: ItemDTO[];
  /** A padlock on this object, if it's still locked and reachable. */
  lock?: SceneLockDTO<LockId>;
}

export type VoteDTO = SceneVoteDTO<Suspect>;

export interface EndingDTO {
  accused: Suspect;
  correct: boolean;
  title: string;
  paragraphs: string[];
  counts: Record<Suspect, number>;
  evidenceFound: number;
  evidenceTotal: number;
  everyClue: boolean;
  minutes: number;
}

export interface SceneDTO {
  /** Visual state flags the art reads, e.g. "suitcase.open", "tap.hot". */
  flags: string[];
  inventory: ItemDTO[];
  closeups: Partial<Record<HotspotId, CloseupDTO>>;
  log: SceneLogEntry[];
  /** Text on the steamed mirror once it shows (drawn mirror-reversed). */
  mirrorLetters: string | null;
  hints: HintNote[];
  /** The puzzle Teodor would help with next, and when its next note is ready (null = now). */
  nextHint: NextHintDTO | null;
  vote: VoteDTO | null;
  ending: EndingDTO | null;
  /** Evidence the team holds, for the accusation. */
  evidence: ItemDTO[];
}

export type SceneAction =
  | { type: "take"; item: ItemId }
  | { type: "operate"; target: HotspotId; op: string }
  | { type: "use"; item: ItemId; target: HotspotId }
  | { type: "combine"; items: [ItemId, ItemId] }
  | { type: "unlock"; lock: LockId; input: string }
  | { type: "item"; item: ItemId; op: string }
  | { type: "hint" }
  | { type: "vote"; suspect: Suspect }
  | { type: "close-vote" }
  | { type: "tiebreak"; suspect: Suspect };

export type SceneActionResponse = SceneActionResponseOf<SceneDTO>;
