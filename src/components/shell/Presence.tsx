"use client";

import { useEffect, useRef } from "react";
import { useLocale, useT } from "@/i18n/client";
import type { PlayerPublic } from "@/lib/types";

/**
 * Where teammates are, so a team can split up without talking over each other.
 *
 * Every game reports one `view` string through the presence heartbeat: Ada "browser:<address>",
 * "app:<app>", "desktop"; the train "train:<wall>" or "train:corridor"; the Atlas "atlas:<place>:<wall>".
 * A close-up adds "/<hotspot>" ("train:door/luggage"), so the wall still matches its prefix.
 */

const PRESENCE_MS = 15_000;

function send(code: string, view: string | null) {
  // keepalive: the last word (closing the tab) still gets through.
  void fetch(`/api/rooms/${encodeURIComponent(code)}/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ view }),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

/**
 * Report this player's view now, whenever it changes, and on the regular heartbeat. A hidden or closed
 * tab reports no view at once, so its avatar leaves the wall straight away (the player stays "online"
 * for the usual window, which votes rely on).
 */
export function usePresence(code: string, view: string) {
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
    if (document.visibilityState !== "hidden") send(code, view);
  }, [code, view]);
  useEffect(() => {
    const beat = () => send(code, document.visibilityState === "hidden" ? null : viewRef.current);
    const id = setInterval(beat, PRESENCE_MS);
    const away = () => send(code, null);
    document.addEventListener("visibilitychange", beat);
    window.addEventListener("pageshow", beat);
    window.addEventListener("pagehide", away);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
      window.removeEventListener("pageshow", beat);
      window.removeEventListener("pagehide", away);
    };
  }, [code]);
}

/** Online teammates (not me) whose view passes `match`. */
export function teammates(players: PlayerPublic[], meId: string, match: (view: string) => boolean): PlayerPublic[] {
  return players.filter((p) => p.online && p.id !== meId && p.currentView !== null && match(p.currentView));
}

/** Matches a view and anything inside it (a wall and its close-ups). */
export function within(base: string): (view: string) => boolean {
  return (v) => v === base || v.startsWith(`${base}/`);
}

/** "Sam", "Sam and Lee", "Sam, Lee and Ana", in the player's language. */
export function useNames() {
  const locale = useLocale();
  return (players: PlayerPublic[]) => {
    const names = players.map((p) => p.displayName);
    try {
      return new Intl.ListFormat(locale, { type: "conjunction" }).format(names);
    } catch {
      return names.join(", ");
    }
  };
}

const SIZES = {
  md: "h-7 w-7 border-2 text-xs",
  sm: "h-[18px] w-[18px] border text-[10px]",
} as const;

/**
 * Small overlapping teammate avatars (their colour and initial). Never takes a tap: it sits over art and
 * icons. `label` makes it readable to screen readers; without one it's decorative.
 */
export function PresenceAvatars({
  players,
  size = "md",
  ring = "#000",
  label,
  className = "",
  max = 3,
}: {
  players: PlayerPublic[];
  size?: keyof typeof SIZES;
  /** Border colour: the surface behind, so overlapping avatars separate. */
  ring?: string;
  label?: string;
  className?: string;
  max?: number;
}) {
  if (players.length === 0) return null;
  const shown = players.slice(0, players.length > max ? max - 1 : max);
  const more = players.length - shown.length;
  return (
    <div
      className={`pointer-events-none flex ${size === "md" ? "-space-x-1.5" : "-space-x-1"} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {shown.map((p) => (
        <span
          key={p.id}
          title={p.displayName}
          className={`pr-in flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-black ${SIZES[size]}`}
          style={{ backgroundColor: p.color, borderColor: ring }}
        >
          {initial(p.displayName)}
        </span>
      ))}
      {more > 0 && (
        <span
          className={`pr-in flex shrink-0 items-center justify-center rounded-full bg-stone-700 font-bold leading-none text-stone-100 ${SIZES[size]}`}
          style={{ borderColor: ring }}
        >
          +{more}
        </span>
      )}
    </div>
  );
}

/** A tiny colour dot per teammate, for places with no room for initials (the wall pips). */
export function PresenceDots({ players, className = "" }: { players: PlayerPublic[]; className?: string }) {
  if (players.length === 0) return null;
  return (
    <span aria-hidden className={`pointer-events-none flex gap-0.5 ${className}`}>
      {players.slice(0, 3).map((p) => (
        <span key={p.id} className="pr-in h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
      ))}
    </span>
  );
}

/** "Sam is looking at this too": one quiet line inside a close-up or app a teammate also has open. */
export function LookingToo({ players, className = "", ring }: { players: PlayerPublic[]; className?: string; ring?: string }) {
  const t = useT();
  const names = useNames();
  if (players.length === 0) return null;
  return (
    <p className={`pr-in pointer-events-none flex min-w-0 items-center gap-2 text-xs ${className}`} role="status">
      <PresenceAvatars players={players} size="sm" ring={ring} />
      <span className="min-w-0 truncate">{t("room.presence.lookingToo", { names: names(players), count: players.length })}</span>
    </p>
  );
}

function initial(name: string): string {
  return (Array.from(name.trim())[0] ?? "?").toUpperCase();
}
