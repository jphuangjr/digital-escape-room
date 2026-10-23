// Contracts shared by every physical-room ("scene") game: a team walks around a set of walls, taps things,
// carries a shared inventory, guesses locks and finally votes. Each game narrows the ids (hotspots, items,
// locks, vote choices) in its own src/lib/<game>/types.ts. Nothing here may contain answers.

/** A button in a close-up or on an item card: something the room can do right now. */
export interface CloseupAction {
  op: string;
  label: string;
}

/** Something the team holds (or can pick up), as a player sees it. */
export interface SceneItemDTO<I extends string = string> {
  id: I;
  name: string;
  description: string;
  /** Evidence for the finale (shown with a magnifier badge). */
  evidence?: boolean;
  /** Long text shown when the item is inspected, only sent once it's held. */
  reading?: { title: string; lines: string[] };
  /** Things you can do to the item itself, e.g. peel a label. */
  actions?: CloseupAction[];
}

/** A lock on an object, if it's still locked and reachable. */
export interface SceneLockDTO<L extends string = string> {
  id: L;
  kind: "digits" | "symbols";
  length: number;
  label: string;
  /** Set while the lock is jammed after too many wrong guesses. */
  jammedUntil?: string;
  /** Wrong guesses left before it jams, once someone has guessed wrong (a count only). */
  left?: number;
}

/** A line in the shared case log ("Sam found a screwdriver"). */
export interface SceneLogEntry {
  id: string;
  at: string;
  playerId: string;
  playerName: string;
  text: string;
  /** A lock opened or a puzzle solved: the whole room gets a moment for it. */
  solve?: boolean;
}

export type HintTier = 1 | 2 | 3;

/** One tier of help for one puzzle, unlocked for the whole room. */
export interface HintNote {
  id: string;
  puzzle: string;
  title: string;
  tier: HintTier;
  text: string;
  at: string;
}

/** The puzzle the next hint would help with, and when it's ready (null = now). */
export interface NextHintDTO {
  title: string;
  tier: HintTier;
  readyAt: string | null;
}

export interface SceneVoteDTO<C extends string = string> {
  open: boolean;
  /** Each player's choice. */
  votes: Record<string, C>;
  /** Choices tied on the most votes when the host must decide. */
  tie: C[] | null;
}

export interface SceneActionResponseOf<D> {
  ok: boolean;
  message?: string;
  scene: D;
  retryAfterSec?: number;
}
