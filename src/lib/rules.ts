import type { PuzzleId } from "./types";

// Game rules shared by server (enforcement) and client (countdowns). No answers here.

/**
 * Puzzles where a wrong answer locks the whole room out for a while, so players work it out with
 * their tools (the Decoder) instead of trying every value.
 */
export const WRONG_ANSWER_LOCKOUT_MS: Partial<Record<PuzzleId, number>> = { "shift-key": 60_000 };

/** Seconds left on a lockout that started with a wrong answer at `lastWrongAt` (0 when none). */
export function lockoutRemainingSec(lastWrongAt: Date | string | null | undefined, now: Date | number, lockoutMs: number): number {
  if (!lastWrongAt) return 0;
  const left = new Date(lastWrongAt).getTime() + lockoutMs - new Date(now).getTime();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}
