"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";

/**
 * One feel for every lock in every game: a crisp press on keys and wheels, a short shake and red edge (and a
 * buzz, where phones allow) on a wrong guess, a brief "open" glow before the close-up moves on, and the same
 * jam banner with a live countdown. Each game passes its own LockTheme so the lock keeps its look.
 * Animations live in globals.css (`lk-`); with reduced motion there is no shake, only the colour changes.
 */

/** How long an opened lock stays on screen, glowing, before the view changes. */
export const OPEN_HOLD_MS = 900;
const WRONG_MS = 480;

export type LockPhase = "idle" | "wrong" | "open";
/** The result of this player's last guess; `n` changes on every guess so the same result can replay. */
export type LockPulse = { kind: "wrong" | "open"; n: number } | null;

export interface LockTheme {
  /** Extra classes on the lock's frame while a wrong guess shows (rings and shadows only, so they never fight the frame's own border). */
  wrong: string;
  /** …and while it opens. */
  open: string;
  /** The jam banner. */
  banner: string;
  /** The countdown ring's arc and track (they draw in currentColor). */
  arc: string;
  track: string;
  /** "1 more wrong guess jams it". */
  note: string;
  /** The padlock badge. */
  badge: string;
}

export const LOCK_THEMES = {
  /** Ada's laptop: stone and amber. */
  laptop: {
    wrong: "ring-2 ring-red-500/70",
    open: "ring-2 ring-amber-300/80 shadow-[0_0_28px_rgba(251,191,36,0.3)]",
    banner: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    arc: "text-amber-300",
    track: "text-amber-300/20",
    note: "text-amber-300",
    badge: "text-amber-300",
  },
  /** The websites in Ada's browser: each has its own colours, so stay neutral and inherit them. */
  site: {
    wrong: "ring-2 ring-red-500/70",
    open: "ring-2 ring-emerald-500/70",
    banner: "border-current/25 bg-current/5",
    arc: "text-amber-500",
    track: "text-current/15",
    note: "font-semibold text-amber-600",
    badge: "text-emerald-600",
  },
  /** The Nightingale Express: art deco brass on dark wood. */
  brass: {
    wrong: "ring-2 ring-[#c0392b]/85",
    open: "ring-2 ring-[#ecd27a]/80 shadow-[0_0_28px_rgba(236,210,122,0.45)]",
    banner: "border-[#c9a227]/40 bg-[#3d2615]/70 text-[#ecd27a]",
    arc: "text-[#ecd27a]",
    track: "text-[#ecd27a]/20",
    note: "text-[#e9a23b]",
    badge: "text-[#c9a227]",
  },
  /** The Atlas: teal glass and old brass. */
  atlas: {
    wrong: "ring-2 ring-[#e0605a]/85",
    open: "ring-2 ring-[#9fd3c7]/80 shadow-[0_0_28px_rgba(159,211,199,0.4)]",
    banner: "border-[#9fd3c7]/40 bg-[#0f2a2f] text-[#d6f2ec]",
    arc: "text-[#d8b56a]",
    track: "text-[#9fd3c7]/20",
    note: "text-[#d8b56a]",
    badge: "text-[#d8b56a]",
  },
} satisfies Record<string, LockTheme>;

/** A short buzz on phones that support it (never throws; desktop browsers just ignore it). */
export function buzz(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch {}
}

/** Seconds left until a time (ISO string or epoch ms), ticking each second; 0 once it has passed. */
export function useSecondsUntil(until: string | number | undefined | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  if (!until) return 0;
  const at = typeof until === "number" ? until : new Date(until).getTime();
  return Math.max(0, Math.ceil((at - now) / 1000));
}

/** The result of this player's guesses, for a shell to hand to its locks: `fire("wrong")` after a miss. */
export function useLockPulse(): [LockPulse, (kind: "wrong" | "open") => void] {
  const [pulse, setPulse] = useState<LockPulse>(null);
  const fire = useCallback((kind: "wrong" | "open") => setPulse((p) => ({ kind, n: (p?.n ?? 0) + 1 })), []);
  return [pulse, fire];
}

/**
 * A lock's feedback state: the phase to draw (a wrong guess shakes for a moment; an open one glows), and how
 * long it's still jammed. `opening` forces the open state, e.g. while useOpenHold keeps an opened lock up.
 */
export function useLockFeedback({ pulse, jammedUntil, opening = false }: { pulse: LockPulse; jammedUntil?: string | number | null; opening?: boolean }) {
  const [phase, setPhase] = useState<LockPhase>("idle");
  // A lock mounted after a guess elsewhere shouldn't replay it.
  const seen = useRef(pulse?.n ?? 0);
  useEffect(() => {
    if (!pulse || pulse.n === seen.current) return;
    seen.current = pulse.n;
    setPhase(pulse.kind);
    buzz(pulse.kind === "wrong" ? [35, 45, 35] : 20);
    const id = setTimeout(() => setPhase("idle"), pulse.kind === "wrong" ? WRONG_MS : OPEN_HOLD_MS);
    return () => clearTimeout(id);
  }, [pulse]);
  const jamSec = useSecondsUntil(jammedUntil);
  return { phase: opening ? ("open" as const) : phase, jamSec, jammed: jamSec > 0 };
}

/**
 * Keep showing `value` for a moment after its lock opens, so the player sees it open before the view moves on.
 * `lock` names the lock currently shown in `scope` (null once there is none); when it goes away within the same
 * scope, the last value is held for `ms` with `opening` set. Changing scope (another close-up) never holds.
 */
export function useOpenHold<T>(value: T, scope: string, lock: string | null | undefined, ms = OPEN_HOLD_MS): { value: T; opening: boolean } {
  const now = { value, scope, lock: lock ?? null };
  const [last, setLast] = useState(now);
  const [held, setHeld] = useState<{ value: T; scope: string } | null>(null);
  // Decided while rendering (not in an effect), so the opened lock never unmounts for a frame and loses its wheels.
  if (last.value !== now.value || last.scope !== now.scope || last.lock !== now.lock) {
    if (last.scope === now.scope && last.lock && last.lock !== now.lock) setHeld({ value: last.value, scope });
    else if (last.scope !== now.scope) setHeld(null);
    setLast(now);
  }
  useEffect(() => {
    if (!held) return;
    const id = setTimeout(() => setHeld(null), ms);
    return () => clearTimeout(id);
  }, [held, ms]);
  return held && held.scope === scope ? { value: held.value, opening: true } : { value, opening: false };
}

/** "0:42" */
export function lockClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Frame classes for a lock in `phase`: shake and red edge when wrong, the open glow when it opens. */
export function lockFrameClass(theme: LockTheme, phase: LockPhase): string {
  return `lk-frame ${phase === "wrong" ? `lk-shake ${theme.wrong}` : phase === "open" ? `lk-open ${theme.open}` : ""}`;
}

/** "Jammed. Try again in 0:42", with a ring that empties as the jam runs out. */
export function JamBanner({ sec, total = 60, theme, className = "" }: { sec: number; total?: number; theme: LockTheme; className?: string }) {
  const t = useT();
  // Announced once; the ticking text itself stays quiet for screen readers.
  const [announce] = useState(() => t("shell.lock.jammed", { time: lockClock(sec) }));
  const r = 15;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, sec / Math.max(total, sec, 1));
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${theme.banner} ${className}`}>
      <span className="sr-only" role="status">
        {announce}
      </span>
      <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3.5" className={theme.track} />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className={`${theme.arc} transition-[stroke-dashoffset] duration-1000 ease-linear`}
        />
      </svg>
      <p className="min-w-0 flex-1 text-left text-sm font-semibold tabular-nums" aria-hidden>
        {t("shell.lock.jammed", { time: lockClock(sec) })}
      </p>
    </div>
  );
}

/** "1 more wrong guess jams it", shown once a guess has gone wrong. */
export function GuessesLeft({ left, theme, className = "" }: { left: number | undefined; theme: LockTheme; className?: string }) {
  const t = useT();
  if (!left || left < 1) return null;
  return <p className={`text-center text-xs font-medium ${theme.note} ${className}`}>{t("shell.lock.left", { n: left })}</p>;
}

/** The jam banner while jammed, otherwise the guesses-left note (if any). */
export function LockStatus({ jamSec, left, theme, total, className = "" }: { jamSec: number; left?: number; theme: LockTheme; total?: number; className?: string }) {
  if (jamSec > 0) return <JamBanner sec={jamSec} total={total} theme={theme} className={className} />;
  return <GuessesLeft left={left} theme={theme} className={className} />;
}

/** A small padlock: the shackle lifts and a check appears when it opens. */
export function LockBadge({ open, theme, className = "h-5 w-5" }: { open: boolean; theme: LockTheme; className?: string }) {
  const t = useT();
  return (
    <svg viewBox="0 0 24 24" className={`${theme.badge} ${className}`} role="img" aria-label={open ? t("shell.lock.opened") : t("shell.lock.locked")}>
      <path
        d="M7.5 11V8a4.5 4.5 0 0 1 9 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="lk-shackle"
        data-open={open || undefined}
      />
      <rect x="4.5" y="11" width="15" height="10" rx="2.2" fill="currentColor" />
      {open ? (
        <path d="M8.5 16 l2.4 2.3 L15.5 13.6" fill="none" stroke="#111" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <circle cx="12" cy="16" r="1.6" fill="#111" fillOpacity="0.6" />
      )}
    </svg>
  );
}
