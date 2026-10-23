import "server-only";
import type { Locale } from "@/i18n/config";
import type { RoomCtx, Who } from "./engine";

/** What one action did to a scene. */
export interface SceneResult<S> {
  scene: S;
  changed: boolean;
  ok: boolean;
  message?: string;
  /** A lock guess to record in the shared Attempts log. */
  attempt?: { lock: string; input: string; correct: boolean };
  /** The game just ended: the room is finished. */
  finished?: boolean;
  /** Extra fields for the acting player's response only (e.g. where a gate just took them). */
  reply?: Record<string, unknown>;
}

export interface SceneDtoOpts {
  startedAt?: Date;
  now?: Date;
  loc?: Locale;
}

/** How a finished room is recorded on the leaderboard and case records. */
export interface SceneEnding {
  /** Stored on Room.ending and CaseRecord.ending. */
  ending: string;
  /** Whether this ending counts as solving the game. */
  solved: boolean;
  hintsUsed: number;
}

/**
 * A physical-room game: its stored scene `S`, the actions `A` players send and the view `D` they receive.
 * Methods (not function properties) so a typed game can sit in the untyped list in ./games.ts.
 */
export interface SceneGame<S = unknown, A = unknown, D = unknown> {
  id: string;
  /** Room.scene as stored, tolerating missing or old fields. */
  parse(raw: unknown): S;
  /** The client's view: only what the team has uncovered, never a code. */
  dto(scene: S, opts: SceneDtoOpts): D;
  /** Whether a request body is one of this game's actions. */
  isAction(body: Record<string, unknown>): boolean;
  /** Apply one action. Pure: no I/O. */
  apply(scene: S, action: A, who: Who, room: RoomCtx, now: Date, loc: Locale): SceneResult<S>;
  /** The lock an action guesses, if any (those are rate-limited). */
  guessedLock(action: A): string | null;
  /** Attempt-log and analytics puzzle id for a lock. */
  lockPuzzleId(lock: string): string;
  /** The "slow down" message when a lock is rate-limited. */
  tooManyMessage(loc: Locale, retryAfterSec: number): string;
  /** How the game ended, once it has. */
  ending(scene: S): SceneEnding | null;
  /** What the team has done so far, for playtest analytics: story flags set and hints taken. */
  progress(scene: S): { flags: string[]; hints: { id: string; puzzle: string; tier: number }[] };
  /** Badges the team earned, kept on each case record. */
  badges(scene: S): string[];
  /** Whether a stored ending (CaseRecord.ending) counts as solving the game. */
  solvedEnding(ending: string | null): boolean;
  /** Who picked up what, from the case log, for the end-of-game credits. `key` marks evidence and the like. */
  finds(scene: S, loc: Locale): { playerId: string; item: string; key: boolean }[];
}

/** Type-checks a game definition; list it in ./games.ts to make rooms of that game playable. */
export function defineSceneGame<S, A, D>(game: SceneGame<S, A, D>): SceneGame<S, A, D> {
  return game;
}
