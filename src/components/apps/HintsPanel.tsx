"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import type { HintPuzzleId } from "@/lib/types";
import { btnGhost, formatCountdown, useNow } from "./shared";

/** Puzzle order in the panel. `label` is English reference data; the UI shows `room.hintTopic.<id>`. */
export const HINT_LABELS: { id: HintPuzzleId; label: string }[] = [
  { id: "bonus-pin", label: "Ada's Personal" },
  { id: "tools-folder", label: "Ada's Tools" },
  { id: "find-blog", label: "Finding Ada's drafts" },
  { id: "shift-key", label: "The cipher key" },
  { id: "find-pets", label: "The forum trail" },
  { id: "pet-id", label: "Biscuit" },
  { id: "intranet-login", label: "The intranet" },
  { id: "binary-lesson", label: "Wren's class" },
  { id: "admin-console", label: "The admin console" },
  { id: "final-phrase", label: "The switch" },
];

const MAX_TIER = 3;

export function HintsPanel({ ctx }: { ctx: GameCtx }) {
  const { state } = ctx;
  const now = useNow(1000);
  const t = useT();
  const [busy, setBusy] = useState<HintPuzzleId | null>(null);
  const [localCooldown, setLocalCooldown] = useState<Partial<Record<HintPuzzleId, string>>>({});
  const [open, setOpen] = useState<HintPuzzleId | null>(null);

  async function request(id: HintPuzzleId, label: string, tier: number) {
    if (
      !window.confirm(
        t("room.hints.confirm", { tier, max: MAX_TIER, label }),
      )
    )
      return;
    setBusy(id);
    const res = await ctx.api<{ cooldownUntil?: string; error?: string }>("/hints", {
      method: "POST",
      body: { puzzleId: id },
    });
    setBusy(null);
    if (res.status === 429) {
      const until = res.data?.cooldownUntil;
      if (until) setLocalCooldown((c) => ({ ...c, [id]: until }));
      ctx.toast(t("room.hints.cooldown"), "info");
    } else if (!res.ok) {
      ctx.toast(res.data?.error ?? t("room.hints.failed"), "error");
    } else {
      ctx.toast(t("room.hints.arrived"), "success");
      setOpen(id);
    }
    await ctx.refresh();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      <div className="shrink-0 border-b border-zinc-800 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{t("room.hints.title")}</div>
        <p className="text-xs text-zinc-500">
          {t("room.hints.intro")}
        </p>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        {HINT_LABELS.map(({ id }) => {
          const label = t(`room.hintTopic.${id}`);
          const hints = state.hints.filter((h) => h.puzzleId === id).sort((a, b) => a.tier - b.tier);
          const nextTier = hints.length + 1;
          const cdIso = [state.hintCooldowns[id], localCooldown[id]]
            .filter((x): x is string => !!x)
            .sort()
            .pop();
          const cdLeft = cdIso ? new Date(cdIso).getTime() - now : 0;
          const cooling = cdLeft > 0;
          const done = nextTier > MAX_TIER;
          const expanded = open === id;
          return (
            <li key={id} className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <button
                onClick={() => setOpen(expanded ? null : id)}
                aria-expanded={expanded}
                className="flex min-h-12 w-full items-center gap-3 px-3 text-left"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{label}</span>
                <span className="flex gap-1" aria-label={t("room.hints.progressAria", { count: hints.length, max: MAX_TIER })}>
                  {Array.from({ length: MAX_TIER }).map((_, i) => (
                    <span key={i} className={`h-2 w-2 rounded-full ${i < hints.length ? "bg-amber-400" : "bg-zinc-700"}`} />
                  ))}
                </span>
                <span className="text-zinc-500" aria-hidden>
                  {expanded ? "▾" : "▸"}
                </span>
              </button>
              {expanded && (
                <div className="space-y-3 border-t border-zinc-800 p-3">
                  {hints.length === 0 && <p className="text-sm text-zinc-500">{t("room.hints.none")}</p>}
                  {hints.map((h) => (
                    <div key={h.tier} className="rounded-lg border-l-2 border-amber-500/50 bg-zinc-950/60 p-2.5">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                        {t("room.hints.tier", { tier: h.tier })}
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">{h.text}</p>
                    </div>
                  ))}
                  {done ? (
                    <p className="text-xs text-zinc-500">{t("room.hints.allUnlocked")}</p>
                  ) : (
                    <button
                      className={`${btnGhost} w-full`}
                      disabled={cooling || busy !== null}
                      onClick={() => request(id, label, nextTier)}
                    >
                      {busy === id
                        ? t("room.hints.calling")
                        : cooling
                          ? t("room.hints.nextIn", { time: formatCountdown(cdLeft) })
                          : t("room.hints.request", { tier: nextTier, max: MAX_TIER })}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="shrink-0 border-t border-zinc-900 p-2">
        <button className={`${btnGhost} w-full`} onClick={() => ctx.openApp("email")}>
          {t("room.hints.openVoicemails")}
        </button>
      </div>
    </div>
  );
}
