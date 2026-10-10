"use client";

import { useEffect, useState } from "react";
import { useIntl, type IntlShape } from "react-intl";
import { useT } from "@/i18n/client";

/** Re-render every `ms` milliseconds; returns current time. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/**
 * "5m ago" / "5분 전". Pass `intl` (from `useIntl()`, or use `useRelativeTime()`) for the viewer's language;
 * without it the result is English.
 */
export function relativeTime(iso: string, now: number = Date.now(), intl?: IntlShape): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (intl) {
    if (s < 10) return intl.formatMessage({ id: "room.time.justNow" });
    const ago = (n: number, unit: "second" | "minute" | "hour" | "day") =>
      intl.formatRelativeTime(-n, unit, { style: "narrow" });
    if (s < 60) return ago(s, "second");
    const m = Math.floor(s / 60);
    if (m < 60) return ago(m, "minute");
    const h = Math.floor(m / 60);
    if (h < 24) return ago(h, "hour");
    return ago(Math.floor(h / 24), "day");
  }
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** `const rel = useRelativeTime(); rel(iso, now)`: relativeTime in the viewer's language. */
export function useRelativeTime() {
  const intl = useIntl();
  return (iso: string, now?: number) => relativeTime(iso, now, intl);
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ColorDot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full ring-1 ring-black/40"
      style={{ backgroundColor: color, width: size, height: size }}
    />
  );
}

export function CompassBadge({ label }: { label?: string }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={12 + Math.cos(a) * 8}
              y1={12 + Math.sin(a) * 8}
              x2={12 + Math.cos(a) * 10}
              y2={12 + Math.sin(a) * 10}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        })}
        <path d="M12 12 L15 6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 12 L10 15.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      </svg>
      {label ?? t("room.compassBadge")}
    </span>
  );
}

export const btn =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";
export const btnPrimary = `${btn} bg-amber-500 text-zinc-950 active:bg-amber-400`;
export const btnGhost = `${btn} border border-zinc-700 bg-zinc-900 text-zinc-200 active:bg-zinc-800`;
export const btnDanger = `${btn} border border-red-900/60 bg-red-950/40 text-red-300 active:bg-red-900/50`;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
