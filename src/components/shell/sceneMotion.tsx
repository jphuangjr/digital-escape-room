"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { flushSync } from "react-dom";

/**
 * How moving between screens feels: turning to another wall pans that way, walking somewhere new pushes through,
 * a close-up grows out of the spot that was tapped and shrinks back into it, and (Ada) a window opens from its icon.
 * Transform and opacity only, always started from wherever the element is right now so a second tap mid-move
 * carries on smoothly, and nothing moves at all under reduced motion.
 */

export const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";
export const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";

export function reducedMotion(): boolean {
  return typeof window === "undefined" || !window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A transform that puts `el`'s box (currently at `to`) over `from`: centred on it, scaled down evenly. */
export function zoomFrom(from: DOMRect, to: DOMRect): string {
  const s = Math.min(1, Math.max(0.06, Math.max(from.width / to.width, from.height / to.height)));
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${s})`;
}

/** Animates `el` to `to` starting from its current on-screen opacity and transform, replacing whatever was running. */
export function fromNow(el: HTMLElement, to: Keyframe, opts: KeyframeAnimationOptions): Animation {
  const cs = getComputedStyle(el);
  const from: Keyframe = {};
  if ("opacity" in to) from.opacity = cs.opacity;
  if ("transform" in to) from.transform = cs.transform;
  for (const a of el.getAnimations()) a.cancel();
  return el.animate([from, to], opts);
}

/** The visible element among several that might show an icon (dock, home screen, desktop column). */
export function visibleRect(selector: string, prefer?: Element | null): DOMRect | null {
  const candidates = [prefer, ...Array.from(document.querySelectorAll(selector))];
  for (const el of candidates) {
    if (!el || !el.isConnected || !el.matches(selector)) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return r;
  }
  return null;
}

// ---------- where a close-up grows from ----------

export type TapOrigin = RefObject<{ rect: DOMRect; at: number } | null>;

/** The last spot tapped in a scene, so the close-up it opens can grow out of it. */
export function useTapOrigin(): TapOrigin {
  return useRef<{ rect: DOMRect; at: number } | null>(null);
}

// ---------- walls ----------

type Layer = { id: string; cls: string; node: ReactNode };
type Move = { n: number; id: string; group: string; from: string | null; kind: "walk" | "turn" | null; dir: 1 | -1; back: boolean };

/**
 * The stage a scene's walls are shown on. `id` is the wall being looked at and `group` the place it's in: a new id
 * in the same place is a turn (panning towards `dir`), a new place is a walk (push through). The wall being left
 * stays as an inert snapshot until it has faded; turning back to it mid-move picks it up where it is.
 */
export function SceneStage({ id, group, dir, origin, children }: { id: string; group: string; dir: 1 | -1; origin?: TapOrigin; children: ReactNode }) {
  const [move, setMove] = useState<Move>({ n: 0, id, group, from: null, kind: null, dir, back: false });
  const [layers, setLayers] = useState<Layer[]>([{ id, cls: "at-enter", node: null }]);
  const last = useRef<ReactNode>(children);
  const els = useRef(new Map<string, HTMLDivElement>());

  if (move.id !== id) {
    const walk = move.group !== group;
    const still = reducedMotion();
    const back = !still && layers.some((l) => l.id === id);
    // At most two walls are ever leaving: the one just left, and the one before it if it hasn't faded yet.
    const older = still ? [] : layers.filter((l) => l.id !== id && l.id !== move.id).slice(-1);
    const keep = new Set([id, ...older.map((l) => l.id), ...(still ? [] : [move.id])]);
    const next = layers.filter((l) => keep.has(l.id)).map((l) => (l.id === move.id ? { ...l, node: last.current } : l.id === id ? { ...l, node: null } : l));
    if (!back) next.push({ id, cls: walk && !still ? "at-enter" : "", node: null });
    setLayers(next);
    setMove({ n: move.n + 1, id, group, from: move.id, kind: walk ? "walk" : "turn", dir, back });
  }

  useLayoutEffect(() => {
    last.current = children;
  });

  useLayoutEffect(() => {
    if (!move.kind || reducedMotion()) return;
    const s = move.dir;
    const walk = move.kind === "walk";
    const outEl = move.from ? els.current.get(move.from) : undefined;
    if (outEl) {
      const gone = move.from;
      const a = fromNow(outEl, walk ? { opacity: 0, transform: "scale(1.06)" } : { opacity: 0, transform: `translateX(${-24 * s}%)` }, {
        duration: walk ? 380 : 300,
        easing: walk ? EASE_IN : EASE_OUT,
        fill: "forwards",
      });
      a.onfinish = () => setLayers((ls) => ls.filter((l) => l.id !== gone));
    }
    const inEl = els.current.get(move.id);
    if (!inEl) return;
    if (move.back) fromNow(inEl, { opacity: 1, transform: "none" }, { duration: 300, easing: EASE_OUT });
    else if (!walk) inEl.animate([{ opacity: 0, transform: `translateX(${24 * s}%)` }, { opacity: 1, transform: "none" }], { duration: 300, easing: EASE_OUT });
    // A walk in is the place's own `at-enter`, already running on the fresh layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [move.n]);

  const record = (e: React.SyntheticEvent) => {
    if (!origin || !(e.target instanceof Element)) return;
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter" && (e as React.KeyboardEvent).key !== " ") return;
    origin.current = { rect: e.target.getBoundingClientRect(), at: performance.now() };
  };

  return (
    <div className="absolute inset-0 isolate" onClickCapture={record} onKeyDownCapture={record}>
      {layers.map((l) => {
        const live = l.id === move.id;
        return (
          <div
            key={l.id}
            ref={(el) => {
              if (!el) return;
              els.current.set(l.id, el);
              return () => {
                if (els.current.get(l.id) === el) els.current.delete(l.id);
              };
            }}
            className={`absolute inset-0 flex items-center justify-center ${l.cls} ${live ? "z-[1]" : "tx-leaving pointer-events-none"}`}
            aria-hidden={live ? undefined : true}
            inert={!live}
          >
            {live ? children : l.node}
          </div>
        );
      })}
    </div>
  );
}

// ---------- close-ups ----------

type SheetZoomRefs = { panel: RefObject<HTMLDivElement | null>; backdrop: RefObject<HTMLButtonElement | null>; root: RefObject<HTMLDivElement | null> };
const SheetZoom = createContext<SheetZoomRefs | null>(null);

/** For a bottom sheet: the refs its root, backdrop and panel attach to when it's shown through `ZoomSheet`. */
export const useSheetZoom = () => useContext(SheetZoom);

/**
 * Shows `render(value)` while `value` is set, growing the sheet's panel out of the tapped spot on open and shrinking
 * it back on close (just a short rise when there's no spot). Reopening mid-close reverses the move.
 */
export function ZoomSheet<T extends string>({ value, origin, render }: { value: T | null; origin?: TapOrigin; render: (v: T) => ReactNode }) {
  const [shown, setShown] = useState<T | null>(value);
  const [closing, setClosing] = useState(false);
  if (value !== null && (value !== shown || closing)) {
    setShown(value);
    setClosing(false);
  } else if (value === null && shown !== null && !closing) {
    if (reducedMotion()) setShown(null);
    else setClosing(true);
  }

  const panel = useRef<HTMLDivElement | null>(null);
  const backdrop = useRef<HTMLButtonElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const refs = useRef<SheetZoomRefs>({ panel, backdrop, root }).current;
  const live = useRef<{ id: T; opening: boolean; anims: Animation[]; from: DOMRect | null } | null>(null);

  useLayoutEffect(() => {
    if (shown === null) {
      live.current = null;
      return;
    }
    const opening = !closing;
    if (root.current) {
      root.current.style.pointerEvents = opening ? "" : "none";
      root.current.inert = !opening;
    }
    const finish = () => {
      if (opening) return;
      const done = live.current;
      // Unmount in the same frame the held end state is let go, so the sheet never blinks back.
      flushSync(() => {
        setShown(null);
        setClosing(false);
      });
      done?.anims.forEach((a) => a.cancel());
    };
    const finishNow = () => {
      setShown(null);
      setClosing(false);
    };
    const cur = live.current;
    if (cur && cur.id === shown && cur.opening === opening) return;
    if (reducedMotion()) {
      if (!opening) finishNow();
      return;
    }
    // Same close-up, other way: turn the running move around.
    if (cur && cur.id === shown && cur.anims.some((a) => a.playState === "running")) {
      cur.anims.forEach((a) => a.reverse());
      cur.opening = opening;
      cur.anims[0].onfinish = finish;
      return;
    }
    cur?.anims.forEach((a) => a.cancel());
    const p = panel.current;
    if (!p) {
      if (!opening) finishNow();
      return;
    }
    const tap = origin?.current;
    const from = opening ? (tap && performance.now() - tap.at < 1500 ? tap.rect : null) : (cur?.from ?? null);
    const start = from ? zoomFrom(from, p.getBoundingClientRect()) : "translateY(32px)";
    const shut: Keyframe = { opacity: 0, transform: start };
    const open: Keyframe = { opacity: 1, transform: "none" };
    const opts: KeyframeAnimationOptions = opening
      ? { duration: from ? 340 : 260, easing: EASE_OUT, fill: "backwards" }
      : { duration: from ? 260 : 200, easing: EASE_IN, fill: "forwards" };
    const frames = opening ? [shut, { opacity: 1, offset: 0.45 }, open] : [open, { opacity: 1, offset: 0.55 }, shut];
    const anims = [p.animate(frames, opts)];
    if (backdrop.current) anims.push(backdrop.current.animate(opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], opts));
    anims[0].onfinish = finish;
    live.current = { id: shown, opening, anims, from };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, closing]);

  return shown === null ? null : <SheetZoom.Provider value={refs}>{render(shown)}</SheetZoom.Provider>;
}

// ---------- Ada's windows ----------

type WinMove = { kind: "open" | "close" | "switch"; app: string; from: string | null };

/**
 * Ada's laptop: the app window grows out of the icon it was opened from and shrinks back into it on the way home;
 * switching apps cross-fades. `active` changes at once as before; this only keeps the window (and the home
 * screen under it) on screen for as long as the move takes.
 */
export function useWindowMotion<A extends string>(active: A | null) {
  const [seen, setSeen] = useState(active);
  const [move, setMove] = useState<WinMove | null>(null);
  if (seen !== active) {
    setSeen(active);
    const kind = reducedMotion() ? null : seen === null ? "open" : active === null ? "close" : "switch";
    setMove(kind ? { kind, app: (active ?? seen) as string, from: seen } : null);
  }

  const win = useRef<HTMLDivElement | null>(null);
  const sections = useRef(new Map<string, HTMLElement>());
  const zoom = useRef<{ app: string; anim: Animation } | null>(null);
  const tapped = useRef<Element | null>(null);

  useLayoutEffect(() => {
    if (!move) return;
    const clear = () => flushSync(() => setMove((m) => (m === move ? null : m)));
    if (move.kind === "switch") {
      const inEl = sections.current.get(move.app);
      const outEl = move.from ? sections.current.get(move.from) : undefined;
      const opts: KeyframeAnimationOptions = { duration: 220, easing: "ease-out" };
      if (inEl) {
        if (inEl.getAnimations().length) fromNow(inEl, { opacity: 1 }, opts);
        else inEl.animate([{ opacity: 0 }, { opacity: 1 }], opts);
      }
      if (!outEl) return void setMove(null);
      const a = fromNow(outEl, { opacity: 0 }, { ...opts, fill: "forwards" });
      a.onfinish = () => {
        clear();
        a.cancel();
      };
      return;
    }
    const w = win.current;
    if (!w) return void setMove(null);
    const opening = move.kind === "open";
    const done = (a: Animation) => () => {
      clear();
      if (!opening) a.cancel();
    };
    // Back the way it came, from wherever it has got to.
    const cur = zoom.current;
    if (cur && cur.app === move.app && cur.anim.playState === "running") {
      cur.anim.reverse();
      cur.anim.onfinish = done(cur.anim);
      return;
    }
    cur?.anim.cancel();
    const icon = visibleRect(`[data-tour="app-${move.app}"]`, opening ? tapped.current : null);
    const box = w.getBoundingClientRect();
    const small: Keyframe = { opacity: 0, transform: icon ? zoomFrom(icon, box) : "scale(0.92)" };
    const full: Keyframe = { opacity: 1, transform: "none" };
    const anim = w.animate(opening ? [small, { opacity: 1, offset: 0.4 }, full] : [full, { opacity: 1, offset: 0.6 }, small], {
      duration: opening ? 340 : 260,
      easing: opening ? EASE_OUT : EASE_IN,
      fill: opening ? "backwards" : "forwards",
    });
    anim.onfinish = done(anim);
    zoom.current = { app: move.app, anim };
  }, [move]);

  return {
    /** The app whose window is on screen (the one closing, while it shrinks). */
    shown: (active ?? (move?.kind === "close" ? move.app : null)) as A | null,
    /** The home screen sits under a window that's growing or shrinking. */
    homeBehind: move?.kind === "open" || move?.kind === "close",
    /** The app being cross-faded away from. */
    leaving: (move?.kind === "switch" ? move.from : null) as A | null,
    win,
    section: (app: A) => (el: HTMLElement | null) => {
      if (!el) return;
      sections.current.set(app, el);
      return () => {
        if (sections.current.get(app) === el) sections.current.delete(app);
      };
    },
    /** Remembers which icon was tapped, so the window opens from that one. */
    onClickCapture: (e: React.MouseEvent) => {
      if (e.target instanceof Element) tapped.current = e.target.closest('[data-tour^="app-"]') ?? tapped.current;
    },
  };
}
