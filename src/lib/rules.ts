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

// ---------- Jamming locks (the physical-room games) ----------

/** Wrong guesses in a row before a lock jams, and for how long. */
export const JAM_AFTER = 3;
export const JAM_SEC = 60;

// ---------- Rate limiting ----------

export const ATTEMPT_LIMIT = 5;
export const ATTEMPT_WINDOW_MS = 60_000;

/**
 * Given timestamps of recent attempts (any order) for one room+puzzle, decide whether a new attempt
 * is allowed. retryAfterSec is when the oldest attempt in the window falls out of it.
 */
export function rateLimitDecision(
  recent: Date[],
  now: Date,
  limit = ATTEMPT_LIMIT,
  windowMs = ATTEMPT_WINDOW_MS,
): { limited: boolean; retryAfterSec: number } {
  const inWindow = recent
    .map((d) => d.getTime())
    .filter((t) => now.getTime() - t < windowMs)
    .sort((a, b) => b - a); // newest first
  if (inWindow.length < limit) return { limited: false, retryAfterSec: 0 };
  // The attempt that must expire before we drop below the limit.
  const pivot = inWindow[limit - 1];
  const retryAfterSec = Math.max(1, Math.ceil((pivot + windowMs - now.getTime()) / 1000));
  return { limited: true, retryAfterSec };
}
