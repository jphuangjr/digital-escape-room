"use client";

import { useLocale, useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import { describeDiscovery, discoverySeparator, discoveryWho } from "@/lib/client/discoveries";
import { ColorDot, useNow, useRelativeTime } from "./shared";

/** Everything the room has found, newest first: new sites (tap to open) and solved puzzles. */
export function CaseLog({ ctx }: { ctx: GameCtx }) {
  const now = useNow(30_000);
  const t = useT();
  const locale = useLocale();
  const relativeTime = useRelativeTime();
  const { discoveries } = ctx.state.progress;
  const colors = new Map(ctx.state.players.map((p) => [p.id, p.color]));

  if (discoveries.length === 0) {
    return <p className="py-6 text-center text-sm text-stone-500">{t("room.caseLog.empty")}</p>;
  }

  return (
    <ol className="space-y-1">
      {[...discoveries].reverse().map((d) => {
        const body = (
          <>
            <span className="mt-1.5 shrink-0">
              <ColorDot color={colors.get(d.playerId) ?? "#78716c"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-stone-200">
                <span className="font-semibold">{discoveryWho(d, t, d.playerId === ctx.state.me.id)}</span>
                {discoverySeparator(locale)}
                {describeDiscovery(d, t)}
              </span>
              <span className="block text-xs text-stone-500">{relativeTime(d.at, now)}</span>
            </span>
            <span aria-hidden className="mt-0.5 shrink-0 text-base">
              {d.kind === "site" ? "🔗" : "✓"}
            </span>
          </>
        );
        return (
          <li key={d.id}>
            {d.kind === "site" ? (
              <button
                type="button"
                onClick={() => ctx.openAddress(d.host)}
                className="flex min-h-12 w-full items-start gap-3 rounded-md px-1 py-1.5 text-left active:bg-stone-900"
                aria-label={t("room.caseLog.openAria", { host: d.host })}
              >
                {body}
              </button>
            ) : (
              <div className="flex min-h-12 items-start gap-3 px-1 py-1.5">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
