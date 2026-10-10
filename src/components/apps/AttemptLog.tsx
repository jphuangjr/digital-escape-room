"use client";

import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import type { PuzzleId } from "@/lib/types";
import { ColorDot, useNow, useRelativeTime } from "./shared";

/** English reference labels; the UI shows the translated `room.puzzle.<id>` messages. */
export const PUZZLE_LABELS: Record<PuzzleId, string> = {
  "tools-folder": "Ada's Tools",
  "shift-key": "Lost Paws cipher",
  "intranet-login": "Intranet login",
  "binary-lesson": "Binary quiz",
  "admin-console": "Admin console",
  "final-phrase": "Dead man's switch",
  "bonus-pin": "Ada's Personal PIN",
};

export function AttemptLog({ ctx }: { ctx: GameCtx }) {
  const attempts = ctx.state.attempts;
  const now = useNow(15000);
  const t = useT();
  const relativeTime = useRelativeTime();
  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div className="shrink-0 border-b border-zinc-800 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {t("room.attempts.title")}{" "}
        <span className="font-normal normal-case tracking-normal text-zinc-600">{t("room.attempts.shared")}</span>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-zinc-900 overflow-y-auto overscroll-contain">
        {attempts.length === 0 && <li className="p-8 text-center text-sm text-zinc-500">{t("room.attempts.empty")}</li>}
        {attempts.map((a) => (
          <li key={a.id} className="flex min-h-11 items-center gap-2.5 px-3 py-2 text-sm">
            <ColorDot color={a.playerColor} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate font-semibold text-zinc-200">{a.playerName}</span>
                <span className="truncate text-xs text-zinc-500">{a.puzzleId in PUZZLE_LABELS ? t(`room.puzzle.${a.puzzleId}`) : a.puzzleId}</span>
              </div>
              <div className="break-all font-mono text-[13px] text-zinc-300">{a.input || t("room.attempts.emptyInput")}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span
                aria-label={t(a.correct ? "room.attempts.correct" : "room.attempts.incorrect")}
                className={`text-base font-bold ${a.correct ? "text-emerald-400" : "text-red-400"}`}
              >
                {a.correct ? "✓" : "✗"}
              </span>
              <span className="text-[11px] text-zinc-500">{relativeTime(a.createdAt, now)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
