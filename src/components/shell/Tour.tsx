"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useT } from "@/i18n/client";
import type { AppId } from "@/lib/types";
import type { RoomTab } from "./RoomSheet";

/**
 * First-run guided tour. Dims the screen, spotlights the real control for each step (found by its
 * data-tour attribute, whichever copy is visible: dock on phones, icons/status bar on desktop) and
 * explains it in a small card. Steps can open the Room sheet on a tab so the spotlight lands on
 * Invite / Chat / Hints inside it.
 */

export const TOUR_DONE_KEY = "escape_tour_done_v1";

type Step = {
  id: string;
  target?: string; // data-tour value; none = centred card
  sheet?: RoomTab | null; // open the Room sheet on this tab (null = close it)
};

const STEPS: Step[] = [
  { id: "welcome", sheet: null },
  { id: "room", target: "room", sheet: null },
  { id: "invite", target: "invite", sheet: "people" },
  { id: "chat", target: "tab-chat", sheet: "people" },
  { id: "hints", target: "tab-hints", sheet: "people" },
  { id: "email", target: "app-email", sheet: null },
  { id: "browser", target: "app-browser", sheet: null },
  { id: "notes", target: "app-notes", sheet: null },
  { id: "files", target: "app-files", sheet: null },
  { id: "end", sheet: null },
];

type Rect = { top: number; left: number; width: number; height: number };

function findTarget(name: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  return (
    els.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }) ?? null
  );
}

export function Tour({
  onClose,
  showSheet,
  openApp,
}: {
  onClose: (finished: boolean) => void;
  showSheet: (tab: RoomTab | null) => void;
  openApp: (app: AppId) => void;
}) {
  const t = useT();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vh, setVh] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // Put the UI in the state this step needs (Room sheet open on a tab, or closed).
  useEffect(() => {
    if (step.sheet !== undefined) showSheet(step.sheet);
  }, [step, showSheet]);

  // Track the target's position (the sheet animates in, the page can resize/scroll).
  const measure = useCallback(() => {
    setVh(window.innerHeight);
    if (!step.target) return setRect(null);
    const el = findTarget(step.target);
    if (!el) return setRect(null);
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);
  useLayoutEffect(() => {
    measure();
    const timers = [80, 250, 450].map((ms) => window.setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const finish = (completed: boolean) => {
    showSheet(null);
    onClose(completed);
    if (completed) openApp("email");
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
      if (e.key === "ArrowRight" && !last) setI((n) => n + 1);
      if (e.key === "ArrowLeft" && i > 0) setI((n) => n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pad = 6;
  const spot = rect && { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
  // Card goes on whichever side of the target has more room; centred when there's no target.
  const below = spot ? spot.top + spot.height / 2 < vh / 2 : false;
  const cardStyle: React.CSSProperties = spot
    ? below
      ? { top: Math.min(spot.top + spot.height + 12, vh - 220) }
      : { bottom: Math.max(vh - spot.top + 12, 12) }
    : { top: "50%", transform: "translateY(-50%)" };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Dim layer with a hole around the target (the box-shadow is the dim). Blocks clicks underneath. */}
      {spot ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-amber-400 transition-all duration-300 ease-out"
          style={{ ...spot, boxShadow: "0 0 0 9999px rgba(5,4,3,0.72)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(5,4,3,0.72)]" />
      )}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        className="absolute left-1/2 w-[min(92vw,22rem)] rounded-2xl border border-amber-500/30 bg-stone-950 p-4 shadow-2xl shadow-black"
        style={{ ...cardStyle, transform: `${cardStyle.transform ?? ""} translateX(-50%)` }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400/80">
            {t("tour.progress", { n: i + 1, total: STEPS.length })}
          </span>
          {!last && (
            <button type="button" onClick={() => finish(false)} className="min-h-9 px-1 text-xs text-stone-500 active:text-stone-300">
              {t("tour.skip")}
            </button>
          )}
        </div>
        <h2 id="tour-title" className="font-serif text-xl text-stone-50">
          {t(`tour.${step.id}.title`)}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-300">{t(`tour.${step.id}.body`)}</p>
        <div className="mt-3 flex items-center gap-1" aria-hidden>
          {STEPS.map((s, n) => (
            <span key={s.id} className={`h-1 flex-1 rounded-full ${n <= i ? "bg-amber-400" : "bg-stone-800"}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {i > 0 && (
            <button
              type="button"
              onClick={() => setI((n) => n - 1)}
              className="min-h-11 rounded-lg border border-stone-700 px-4 text-sm text-stone-300 active:bg-stone-900"
            >
              {t("tour.back")}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => (last ? finish(true) : setI((n) => n + 1))}
            className="min-h-11 flex-1 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black active:bg-amber-400"
          >
            {last ? t("tour.done") : t("tour.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
