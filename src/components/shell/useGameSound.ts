"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameSound, type Ambience } from "./gameSound";

/** What the shell is showing, so the sound can follow it: each change plays its cue. */
export interface SoundCues {
  /** Where the player stands (the ambience follows it). */
  place: string;
  /** The open close-up or app; a new non-empty value plays "open". */
  open?: string | null;
  /** The wall being faced; a change plays "turn". */
  turn?: string;
  /** The room sheet; opening it plays "sheet". */
  sheet?: boolean;
  /** Tick softly while typing in a text field. */
  typing?: boolean;
}

/**
 * Mount a game's sound (see gameSound.ts) for the shell: start it on the first tap if it's on, pause it while the
 * tab is hidden, tick on buttons, and play the cue for each change in `cues`. Returns the switch for the shell's
 * speaker button and the engine for one-off sounds (a lock, an item taken).
 */
export function useGameSound(opts: { prefKey: string; defaultOn: boolean; ambience: () => Ambience | null }, cues: SoundCues) {
  const sound = useRef<GameSound | null>(null);
  const [on, setOn] = useState(opts.defaultOn);
  const make = useRef(opts);
  const typing = Boolean(cues.typing);

  useEffect(() => {
    const { prefKey, defaultOn, ambience } = make.current;
    const s = new GameSound(prefKey, defaultOn, ambience());
    sound.current = s;
    s.attach();
    setOn(s.enabled);
    // Browsers only allow audio after a gesture: every tap or key may (re)start it.
    const wake = () => s.wake();
    const click = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target.closest("button, a, [role=button], summary") : null;
      if (el && !el.hasAttribute("disabled")) s.play("tap");
    };
    const input = (e: Event) => {
      const el = e.target;
      if (el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && /^(text|search|password|email|url|tel|number|)$/.test(el.type))) s.play("type");
    };
    const vis = () => s.setHidden(document.visibilityState === "hidden");
    window.addEventListener("pointerdown", wake, true);
    window.addEventListener("keydown", wake, true);
    document.addEventListener("click", click, true);
    if (typing) document.addEventListener("input", input, true);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pointerdown", wake, true);
      window.removeEventListener("keydown", wake, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("input", input, true);
      document.removeEventListener("visibilitychange", vis);
      s.detach();
      sound.current = null;
    };
  }, [typing]);

  useEffect(() => sound.current?.setPlace(cues.place), [cues.place]);

  // Cues: only changes after mount count.
  const prev = useRef<SoundCues | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = cues;
    const s = sound.current;
    if (!p || !s) return;
    if (cues.open && cues.open !== p.open) s.play("open");
    else if (cues.turn !== p.turn && cues.place === p.place) s.play("turn");
    if (cues.sheet && !p.sheet) s.play("sheet");
  });

  const toggle = useCallback(() => {
    const s = sound.current;
    if (!s) return;
    s.setEnabled(!s.enabled);
    setOn(s.enabled);
  }, []);

  return { on, toggle, sound };
}
