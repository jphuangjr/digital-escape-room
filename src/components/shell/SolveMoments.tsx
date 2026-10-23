"use client";

import { useEffect, useRef, useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import { activeGameSound } from "./gameSound";

// Shared "the room did it" moments for every game: when anyone opens a lock or solves a puzzle, everyone in the
// room sees a brass toast naming who and what, a brief glow round the screen, and (with the game's sound on) hears
// a soft chime. New things in the team's hands glow on their tab and tile. Both are detected on the client from
// room state, so they work with push updates and with the poll alike; whatever was already there when the page
// loaded is history and never replays.

/** A solve as the toast should read it, already in the viewer's language ("Lee opened the cash box"). */
export interface SolveLine {
  id: string;
  text: string;
}

/** How long the glow and tile highlights stay on (the animations themselves finish well inside this). */
const GLOW_MS = 1200;

/**
 * Toast each solve that arrives after mount (the solver included) and return a key that changes with each one, for
 * `<SolveGlow>`. `lines` may be rebuilt every render; only ids not seen before count.
 */
export function useSolveMoments(lines: SolveLine[], toast: GameCtx["toast"]): number {
  const known = useRef<Set<string> | null>(null);
  const [flash, setFlash] = useState(0);
  const ids = lines.map((l) => l.id).join("|");
  useEffect(() => {
    if (known.current) {
      const fresh = lines.filter((l) => !known.current!.has(l.id));
      for (const l of fresh) toast(l.text, "solve");
      if (fresh.length) {
        setFlash((n) => n + 1);
        activeGameSound()?.chime();
      }
    }
    known.current = new Set(lines.map((l) => l.id));
    // `ids` stands for `lines`: a rebuilt array with the same entries is no change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, toast]);
  return flash;
}

/** A brief brass glow round the edge of the screen, replayed whenever `flash` changes (not on 0). Decorative. */
export function SolveGlow({ flash }: { flash: number }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!flash) return;
    setOn(flash);
    const id = setTimeout(() => setOn(0), GLOW_MS);
    return () => clearTimeout(id);
  }, [flash]);
  if (!on) return null;
  return <div key={on} aria-hidden className="sm-glow pointer-events-none fixed inset-0 z-[55]" />;
}

/**
 * Ids in `ids` that weren't there a moment ago (not counting what was there on mount). Each stays in the set for
 * about a second, long enough for the fly-in and glow to play.
 */
export function useArrivals(ids: string[]): Set<string> {
  const known = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const key = ids.join("|");
  useEffect(() => {
    const prev = known.current;
    known.current = new Set(ids);
    if (!prev) return;
    const added = ids.filter((id) => !prev.has(id));
    if (!added.length) return;
    setFresh((s) => new Set([...s, ...added]));
    timers.current.push(setTimeout(() => setFresh((s) => new Set([...s].filter((id) => !added.includes(id)))), GLOW_MS));
    // `key` stands for `ids`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return fresh;
}
