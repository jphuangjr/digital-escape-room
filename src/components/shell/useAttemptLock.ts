"use client";

import { useCallback, useMemo, useState } from "react";
import type { AttemptDTO, PuzzleId } from "@/lib/types";
import { ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS, WRONG_ANSWER_LOCKOUT_MS } from "@/lib/rules";
import { useNow } from "@/components/apps/shared";
import { useLockPulse } from "./lockFeel";
import { activeGameSound } from "./gameSound";

/** Show "n more wrong guesses" only when it's close. */
const WARN_AT = 2;

/**
 * Ada's locks (the Files PINs and the websites' forms) on top of the shared lock feel. The server limits each
 * puzzle room-wide (ATTEMPT_LIMIT tries a minute; some puzzles lock for a while after any wrong answer), and
 * the shared attempt log has every try's time, so every phone in the room can show the same jam and countdown
 * without being told anything about the answer. A 429 from the server still wins if it says longer.
 */
export function useAttemptLock(attempts: AttemptDTO[], puzzleId: PuzzleId) {
  const [pulse, firePulse] = useLockPulse();
  // The lock's sound goes with its look.
  const fire = useCallback(
    (kind: "wrong" | "open") => {
      firePulse(kind);
      activeGameSound()?.lock(kind === "open" ? "open" : "thunk");
    },
    [firePulse],
  );
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const now = useNow(1000);
  const room = useMemo(() => {
    const lockout = WRONG_ANSWER_LOCKOUT_MS[puzzleId];
    // Ignore entries "from the future" (a phone whose clock runs behind) beyond a little slack.
    const times = attempts
      .filter((a) => a.puzzleId === puzzleId)
      .map((a) => ({ at: new Date(a.createdAt).getTime(), correct: a.correct }))
      .filter((a) => a.at <= now + 5_000);
    if (lockout) {
      const lastWrong = times.find((a) => !a.correct)?.at;
      const until = lastWrong && lastWrong + lockout > now ? Math.min(lastWrong + lockout, now + lockout) : null;
      return { until, left: undefined };
    }
    const recent = times
      .map((a) => a.at)
      .filter((at) => now - at < ATTEMPT_WINDOW_MS)
      .sort((a, b) => b - a);
    if (recent.length >= ATTEMPT_LIMIT) return { until: recent[ATTEMPT_LIMIT - 1] + ATTEMPT_WINDOW_MS, left: undefined };
    const left = ATTEMPT_LIMIT - recent.length;
    return { until: null, left: recent.length > 0 && left <= WARN_AT ? left : undefined };
  }, [attempts, puzzleId, now]);
  const local = retryUntil && retryUntil > now ? retryUntil : null;
  const jammedUntil = room.until || local ? Math.max(room.until ?? 0, local ?? 0) : null;
  /** The server said wait `sec` seconds. */
  const retryAfter = useCallback((sec: number) => setRetryUntil(Date.now() + sec * 1000), []);
  return { pulse, fire, jammedUntil, left: jammedUntil ? undefined : room.left, retryAfter };
}
