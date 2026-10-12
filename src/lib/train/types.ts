// The Nightingale Express: contracts between server and client for physical-room games.
// Nothing here may contain answers; lock codes and code-revealing text live in src/server/train.

export const TRAIN_GAME_ID = "nightingale-express";

/** Where a player is looking. Personal (not shared): the corridor opens once the door does. */
export type TrainRoomId = "12b" | "corridor";

/** The four walls of Compartment 12B, in turning order (right turns go forward). */
export type WallId = "window" | "door" | "berths" | "washstand";
export const WALLS_12B: WallId[] = ["window", "door", "berths", "washstand"];

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
  | "towel";

export type ItemId = "pouch" | "washstand-key" | "screwdriver" | "telegram-left" | "telegram-right" | "telegram" | "cufflink";

export type LockId = "suitcase" | "door";

export interface ItemDTO {
  id: ItemId;
  name: string;
  description: string;
  /** Evidence for the finale (shown with a magnifier badge). */
  evidence?: boolean;
  /** Long text shown when the item is inspected (e.g. the telegram), only sent once it's held. */
  reading?: { title: string; lines: string[] };
}

/** A button in a close-up: an action the room can take on this object right now. */
export interface CloseupAction {
  op: string;
  label: string;
}

/** A styled read-out in a close-up: a newspaper page, a luggage tag, a fogged mirror. */
export type CloseupDoc =
  | { kind: "newspaper"; masthead: string; date: string; headline: string; column: string[]; timetableTitle: string; timetable: string[][] }
  | { kind: "tag"; lines: string[] }
  | { kind: "note"; lines: string[] }
  | { kind: "mirror"; fogged: boolean; letters?: string };

export interface CloseupDTO {
  title: string;
  lines: string[];
  doc?: CloseupDoc;
  actions: CloseupAction[];
  /** Items lying here that can be picked up. */
  takes: ItemDTO[];
  /** A padlock on this object, if it's still locked and reachable. */
  lock?: { id: LockId; kind: "digits"; length: number; label: string };
}

export interface SceneLogEntry {
  id: string;
  at: string;
  playerId: string;
  playerName: string;
  text: string; // "found a screwdriver"
}

export interface SceneDTO {
  /** Visual state flags the art reads, e.g. "suitcase.open", "tap.hot". */
  flags: string[];
  inventory: ItemDTO[];
  closeups: Partial<Record<HotspotId, CloseupDTO>>;
  log: SceneLogEntry[];
  /** Text on the steamed mirror once it shows (drawn mirror-reversed). */
  mirrorLetters: string | null;
}

export type SceneAction =
  | { type: "take"; item: ItemId }
  | { type: "operate"; target: HotspotId; op: string }
  | { type: "use"; item: ItemId; target: HotspotId }
  | { type: "combine"; items: [ItemId, ItemId] }
  | { type: "unlock"; lock: LockId; input: string };

export interface SceneActionResponse {
  ok: boolean;
  message?: string;
  scene: SceneDTO;
  retryAfterSec?: number;
}
