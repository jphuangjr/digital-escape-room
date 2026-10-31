"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { formatDuration } from "@/lib/games";
import type { RoomResult } from "@/lib/result";
import { useT } from "@/i18n/client";

/**
 * The end-of-game reveal every game shares: the ending's title, then the stats counting up, who did what,
 * the badges this run earned and the room's rank, then the buttons and the ending's own story below.
 * About four seconds; a tap skips straight to the end, and reduced motion shows everything at once.
 * Each game passes its own colours (`theme`) and its own extras (evidence, secrets, the Ada badges).
 */

export interface RevealTheme {
  eyebrow: string;
  /** Highlights: "opened the most locks", the rank. A text colour only. */
  accent: string;
  title: string;
  /** Small caps labels (stat names, section headings). */
  label: string;
  /** Big numbers. */
  value: string;
  tile: string;
  /** Lines between credit rows. */
  divide: string;
  muted: string;
  /** Body text: names, credit lines. */
  text: string;
  chip: string;
  primary: string;
  ghost: string;
}

export interface RevealStat {
  label: string;
  value: number;
  /** Shown as "value/total". */
  total?: number;
}

/** When each step appears, in ms from the ending opening. */
const STEP_AT = [0, 700, 2100, 2900, 3500];
const COUNT_MS = 1200;
const LAST = STEP_AT.length - 1;
const seenKey = (code: string) => `result_seen_${code}`;

function useCountUp(target: number, run: boolean, instant: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (instant) {
      setV(target);
      return;
    }
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / COUNT_MS);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, instant]);
  return v;
}

function Tile({ theme, label, value, total, sub, format, run, instant }: RevealStat & { theme: RevealTheme; sub?: string; format?: (n: number) => string; run: boolean; instant: boolean }) {
  const n = useCountUp(value, run, instant);
  const shown = run || instant;
  return (
    <div className={`rounded-lg border p-2 text-center ${theme.tile}`}>
      <p className={`text-10px uppercase tracking-wider ${theme.label}`}>{label}</p>
      <p className={`font-mono text-lg tabular-nums ${theme.value}`}>
        {shown ? (format ? format(n) : n) : "–"}
        {total !== undefined && shown && <span className={theme.muted}>/{total}</span>}
      </p>
      {sub && <p className={`text-11px ${theme.muted}`}>{sub}</p>}
    </div>
  );
}

export function ResultReveal({
  code,
  gameId,
  signedIn,
  eyebrow,
  title,
  titleId,
  extraStats = [],
  badgeSlot,
  slotBadges = [],
  extraActions,
  theme,
  children,
}: {
  code: string;
  gameId: string;
  signedIn: boolean;
  eyebrow: ReactNode;
  title: string;
  titleId?: string;
  extraStats?: RevealStat[];
  /** The game's own badge art, shown with the badges; `slotBadges` are left out of the generic list. */
  badgeSlot?: ReactNode;
  slotBadges?: string[];
  /** Buttons before "Play again", e.g. "Keep browsing Ada's laptop". */
  extraActions?: ReactNode;
  theme: RevealTheme;
  /** The ending's story, epilogues and leaderboard: shown once the reveal has played. */
  children?: ReactNode;
}) {
  const t = useT();
  const [result, setResult] = useState<RoomResult | null>(null);
  const [step, setStep] = useState(0);
  const [instant, setInstant] = useState(false);
  const [copied, setCopied] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/rooms/${encodeURIComponent(code)}/result`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<RoomResult>) : null))
      .then((r) => alive && r && setResult(r))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [code]);

  // Play once per room per tab; reduced motion (or a second visit) shows everything at once.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(seenKey(code)) === "1";
      sessionStorage.setItem(seenKey(code), "1");
    } catch {}
    const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setInstant(true);
      setStep(LAST);
      return;
    }
    const timers = STEP_AT.slice(1).map((at, i) => window.setTimeout(() => setStep(i + 1), at));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [code]);

  const done = step >= LAST;
  const skip = () => {
    if (done) return;
    setInstant(true);
    setStep(LAST);
  };
  const on = (s: number) =>
    `transition duration-500 ease-out motion-reduce:transition-none ${step >= s ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`;
  const counting = step >= 1 && result !== null;

  const gameTitle = t(`site.game.${gameId}.title`);
  async function share() {
    if (!result?.shareId) return;
    const url = `${window.location.origin}/s/${result.shareId}`;
    const text = t("result.shareText", { solved: result.solved ? "yes" : "no", game: gameTitle, time: formatDuration(result.durationMs) });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: gameTitle, text, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("result.share"), url);
    }
  }

  const credits = [...(result?.credits ?? [])].sort((a, b) => b.solved + b.found - (a.solved + a.found));
  const topSolved = Math.max(0, ...credits.map((c) => c.solved));
  const topFound = Math.max(0, ...credits.map((c) => c.found));
  const scene = gameId !== "ada-voss";
  const badges = (result?.badges ?? []).filter((b) => !slotBadges.includes(b)).map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter((a) => a !== undefined);

  return (
    <div onClick={skip} className="space-y-6">
      <header className={`pt-2 text-center ${on(0)}`}>
        <div className={`text-11px uppercase tracking-[0.3em] ${theme.eyebrow}`}>{eyebrow}</div>
        <h1 id={titleId} className={`mt-2 ${theme.title}`}>
          {title}
        </h1>
      </header>

      <section className={`space-y-2 ${on(1)}`} aria-label={t("board.yourResult")}>
        <div className="grid grid-cols-3 gap-2">
          <Tile theme={theme} label={t("result.stat.time")} value={result?.durationMs ?? 0} format={formatDuration} run={counting} instant={instant && !!result} />
          <Tile theme={theme} label={t("result.stat.hints")} value={result?.hintsUsed ?? 0} run={counting} instant={instant && !!result} />
          <Tile
            theme={theme}
            label={t("result.stat.attempts")}
            value={result?.attempts ?? 0}
            sub={result ? t("result.stat.wrong", { n: result.wrongAttempts }) : undefined}
            run={counting}
            instant={instant && !!result}
          />
        </div>
        {extraStats.length > 0 && (
          <div className={`grid gap-2 ${extraStats.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {extraStats.map((s) => (
              <Tile key={s.label} theme={theme} {...s} run={step >= 1} instant={instant} />
            ))}
          </div>
        )}
      </section>

      {credits.length > 0 && (
        <section className={on(2)}>
          <h2 className={`mb-2 text-xs font-semibold uppercase tracking-widest ${theme.label}`}>{t("result.credits")}</h2>
          <ul className={`divide-y rounded-xl border ${theme.tile} ${theme.divide}`}>
            {credits.map((c) => {
              const parts = [
                c.solved > 0 && t(scene ? "result.credit.locks" : "result.credit.puzzles", { n: c.solved }),
                c.found > 0 && t("result.credit.finds", { n: c.found }),
              ].filter(Boolean);
              const tops = credits.length > 1
                ? [
                    c.solved > 0 && c.solved === topSolved && t(scene ? "result.credit.topLocks" : "result.credit.topPuzzles"),
                    c.found > 0 && c.found === topFound && t("result.credit.topFinds"),
                  ].filter(Boolean)
                : [];
              return (
                <li key={c.playerId} className="flex gap-3 px-3 py-2">
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${theme.text}`}>{c.name}</p>
                    <p className={`text-xs ${theme.muted}`}>{parts.length ? parts.join(" · ") : t("result.credit.support")}</p>
                    {tops.length > 0 && <p className={`text-xs ${theme.accent}`}>★ {tops.join(" · ")}</p>}
                    {c.keyItems.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.keyItems.map((it) => (
                          <span key={it} className={`rounded-full border px-2 py-0.5 text-11px ${theme.chip}`}>
                            {it}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(badges.length > 0 || badgeSlot || result?.rank || result?.testRun) && (
        <section className={`space-y-3 text-center ${on(3)}`}>
          {badges.length > 0 && (
            <>
              <h2 className={`text-xs font-semibold uppercase tracking-widest ${theme.label}`}>{t("result.badges")}</h2>
              <ul className="flex flex-wrap justify-center gap-2">
                {badges.map((a) => (
                  <li key={a.id} title={t(`profile.ach.${a.id}.how`)} className={`rounded-full border px-3 py-1 text-sm ${theme.chip}`}>
                    <span aria-hidden>{a.icon}</span> {t(`profile.ach.${a.id}.name`)}
                  </li>
                ))}
              </ul>
            </>
          )}
          {badgeSlot}
          {result?.rank && <p className={`font-mono text-sm ${theme.accent}`}>{t("result.rank", { rank: result.rank, total: result.boardSize })}</p>}
          {result?.testRun && <p className={`font-mono text-xs ${theme.muted}`}>{t("result.testRun")}</p>}
        </section>
      )}

      <div className={`flex flex-col gap-2 ${on(4)}`}>
        {result?.shareId && (
          <button type="button" onClick={() => void share()} className={theme.primary}>
            {copied ? t("result.shareCopied") : t("result.share")}
          </button>
        )}
        {extraActions}
        <Link href={`/play/${gameId}`} className={theme.ghost}>
          {t("site.playAgain")}
        </Link>
        {signedIn && (
          <Link href="/profile" className={theme.ghost}>
            {t("profile.link")}
          </Link>
        )}
        <Link href="/" className={theme.ghost}>
          {t("room.ending.backToLobby")}
        </Link>
        {children && (
          <button
            type="button"
            onClick={() => storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={`min-h-11 text-sm underline underline-offset-4 ${theme.muted}`}
          >
            {t("result.readEnding")} ↓
          </button>
        )}
      </div>

      {!done && (
        <button type="button" onClick={skip} className={`fixed inset-x-0 bottom-0 z-10 min-h-11 pb-[env(safe-area-inset-bottom)] text-xs uppercase tracking-widest ${theme.muted}`}>
          {t("result.skip")}
        </button>
      )}

      {children && (
        <div ref={storyRef} className={`scroll-mt-4 space-y-6 ${on(4)}`}>
          {children}
        </div>
      )}
    </div>
  );
}
