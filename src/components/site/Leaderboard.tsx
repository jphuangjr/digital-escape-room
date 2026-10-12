"use client";

import { useEffect, useState } from "react";
import type { LeaderboardResponse, LeaderboardRow } from "@/lib/types";
import { formatDuration } from "@/lib/games";
import { useT } from "@/i18n/client";

/**
 * A game's public leaderboard: fastest teams, with answers tried and hints used. Shown on the game's
 * landing page ("noir" tone) and on the end-of-game screen ("room" tone), where `roomCode` also pulls
 * in this room's own result and overall rank.
 */

const TONES = {
  noir: {
    box: "rounded-xl border border-noir-line bg-noir-bg-2/90 p-4",
    heading: "font-mono text-xs uppercase tracking-[0.3em] text-noir-ink-faint",
    sub: "text-xs text-noir-ink-faint",
    row: "border-noir-line",
    mineRow: "border-noir-brass/50 bg-noir-brass/10",
    name: "text-noir-ink",
    meta: "text-noir-ink-faint",
    time: "text-noir-brass",
    stat: "border-noir-line bg-noir-bg-3",
  },
  room: {
    box: "rounded-xl border border-zinc-800 bg-zinc-900/60 p-4",
    heading: "text-xs font-semibold uppercase tracking-widest text-zinc-500",
    sub: "text-xs text-zinc-500",
    row: "border-zinc-800",
    mineRow: "border-amber-500/50 bg-amber-500/10",
    name: "text-zinc-100",
    meta: "text-zinc-500",
    time: "text-amber-300",
    stat: "border-zinc-800 bg-zinc-950/60",
  },
} as const;

type Tone = keyof typeof TONES;

const MEDALS = ["text-amber-300", "text-zinc-300", "text-orange-400"];

export function Leaderboard({ gameId, roomCode, tone = "noir" }: { gameId: string; roomCode?: string; tone?: Tone }) {
  const t = useT();
  const c = TONES[tone];
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = roomCode ? `?room=${encodeURIComponent(roomCode)}` : "";
    fetch(`/api/leaderboard/${encodeURIComponent(gameId)}${q}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<LeaderboardResponse>) : null))
      .then((d) => !cancelled && setData(d ?? { total: 0, top: [], mine: null }))
      .catch(() => !cancelled && setData({ total: 0, top: [], mine: null }));
    return () => {
      cancelled = true;
    };
  }, [gameId, roomCode]);

  const mine = data?.mine ?? null;
  const mineInTop = Boolean(data?.top.some((r) => r.mine));

  return (
    <section className={`flex flex-col gap-3 ${c.box}`} aria-labelledby={`board-${gameId}`}>
      <div>
        <h2 id={`board-${gameId}`} className={c.heading}>
          {t("board.title")}
        </h2>
        {data && <p className={`mt-1 ${c.sub}`}>{t("board.subtitle", { total: data.total })}</p>}
      </div>

      {mine && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-sm font-semibold ${c.name}`}>{t("board.yourResult")}</span>
            <span className={`font-mono text-sm font-bold ${c.time}`}>
              {t("board.rankOf", { rank: mine.rank, total: data!.total })}
            </span>
          </div>
          <dl className="grid grid-cols-4 gap-2 text-center">
            <Stat tone={tone} label={t("board.stat.time")} value={formatDuration(mine.durationMs)} />
            <Stat tone={tone} label={t("board.stat.answers")} value={mine.attempts} />
            <Stat tone={tone} label={t("board.stat.wrong")} value={mine.wrongAttempts} />
            <Stat tone={tone} label={t("board.stat.hints")} value={mine.hintsUsed} />
          </dl>
        </div>
      )}

      {!data ? (
        <p className={`py-2 text-sm ${c.meta}`}>{t("board.loading")}</p>
      ) : data.top.length === 0 ? (
        <p className={`py-2 text-sm ${c.meta}`}>{t("board.empty")}</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {data.top.map((r) => (
            <Row key={`${r.rank}-${r.finishedAt}`} row={r} tone={tone} />
          ))}
          {mine && !mineInTop && (
            <>
              <li aria-hidden className={`text-center text-xs leading-none ${c.meta}`}>
                ⋮
              </li>
              <Row row={mine} tone={tone} />
            </>
          )}
        </ol>
      )}

      {data && data.top.length > 0 && <p className={`text-[11px] ${c.meta}`}>{t("board.timeNote")}</p>}
    </section>
  );
}

function Stat({ tone, label, value }: { tone: Tone; label: string; value: string | number }) {
  const c = TONES[tone];
  return (
    <div className={`rounded-lg border px-1 py-2 ${c.stat}`}>
      <dt className={`text-[10px] uppercase tracking-wider ${c.meta}`}>{label}</dt>
      <dd className={`font-mono text-base font-bold ${c.name}`}>{value}</dd>
    </div>
  );
}

const SHOWN_NAMES = 3;

function Row({ row, tone }: { row: LeaderboardRow; tone: Tone }) {
  const t = useT();
  const c = TONES[tone];
  const shown = row.players.slice(0, SHOWN_NAMES);
  const more = row.playerCount - shown.length;
  return (
    <li className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${row.mine ? c.mineRow : c.row}`}>
      <span className={`w-6 shrink-0 text-center font-mono text-sm font-bold ${MEDALS[row.rank - 1] ?? c.meta}`}>
        {row.rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`flex min-w-0 items-center gap-1.5 text-sm ${c.name}`}>
          <span className="flex shrink-0 -space-x-1" aria-hidden>
            {shown.map((p, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full ring-1 ring-black/60" style={{ background: p.color }} />
            ))}
          </span>
          <span className="truncate">
            {shown.map((p) => p.name).join(", ")}
            {more > 0 && <span className={c.meta}> {t("board.morePlayers", { n: more })}</span>}
          </span>
          {row.mine && (
            <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider ${c.time}`}>{t("board.you")}</span>
          )}
        </span>
        <span className={`block truncate text-xs ${c.meta}`}>
          {!row.solved && <span className="text-red-400">{t("board.unsolved")} · </span>}
          {t("board.rowMeta", { attempts: row.attempts, wrong: row.wrongAttempts, hints: row.hintsUsed })}
        </span>
      </span>
      <span className={`shrink-0 font-mono text-sm font-semibold ${c.time}`}>{formatDuration(row.durationMs)}</span>
    </li>
  );
}
