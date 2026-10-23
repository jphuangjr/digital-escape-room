"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import type { GameCtx } from "@/lib/client/game";
import type { ChapterDTO } from "@/lib/types";

// A sense of progress without spoilers, for every game's header: a thin segmented line (one segment per chapter,
// filled up to the team's), a small sheet listing the chapters reached, and a "New chapter" toast for the whole
// room when the team moves on. The server sends only the chapter count and the names of chapters already reached,
// so nothing here can give away what's ahead.

type Theme = "ada" | "train" | "atlas";

const THEMES: Record<Theme, { on: string; off: string; label: string; press: string; panel: string; title: string; row: string; muted: string }> = {
  ada: {
    on: "bg-amber-500",
    off: "bg-stone-700",
    label: "text-amber-500/90",
    press: "active:bg-stone-900",
    panel: "border-amber-500/40 bg-stone-950",
    title: "font-serif text-amber-300",
    row: "border-stone-800 bg-stone-900/60",
    muted: "text-stone-500",
  },
  train: {
    on: "bg-[#ecd27a]",
    off: "bg-[#4a3220]",
    label: "text-[#ecd27a]/90",
    press: "active:bg-[#3d2615]",
    panel: "border-[#c9a227]/40 bg-[#1b120b]",
    title: "font-serif text-[#ecd27a]",
    row: "border-[#3d2615] bg-[#120c07]",
    muted: "text-stone-500",
  },
  atlas: {
    on: "bg-[#9fd3c7]",
    off: "bg-[#1f3640]",
    label: "text-[#9fd3c7]",
    press: "active:bg-[#1f3640]",
    panel: "border-[#9fd3c7]/40 bg-[#0b161b]",
    title: "font-serif text-[#f4e7b5]",
    row: "border-[#1f3640] bg-[#0f2129]",
    muted: "text-stone-500",
  },
};

/** How long the header line glows after a new chapter (the animation itself is shorter). */
const NEW_MS = 1400;

export function ChapterLine({ chapter, toast, theme }: { chapter: ChapterDTO; toast: GameCtx["toast"]; theme: Theme }) {
  const t = useT();
  const c = THEMES[theme];
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState(false);
  const { index, total, reached } = chapter;
  const name = reached[index - 1] ?? "";

  // A new chapter after the page loaded is a moment for the whole room; the chapter on arrival is not.
  const known = useRef<number | null>(null);
  useEffect(() => {
    const prev = known.current;
    known.current = index;
    if (prev === null || index <= prev) return;
    toast(t("shell.chapter.new", { n: index, total, name }), "chapter");
    setFresh(true);
    const id = setTimeout(() => setFresh(false), NEW_MS);
    return () => clearTimeout(id);
  }, [index, total, name, toast, t]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("shell.chapter.aria", { n: index, total, name })}
        className={`flex h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-md px-1.5 ${c.press} ${fresh ? "sm-new-tab" : ""}`}
      >
        <span aria-hidden className={`font-mono text-[10px] leading-none tracking-[0.12em] ${c.label}`}>
          {index}/{total}
        </span>
        <span aria-hidden className="flex gap-[3px]">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-[3px] w-2 rounded-full transition-colors duration-700 ${i < index ? c.on : c.off}`} />
          ))}
        </span>
      </button>
      {open && <ChapterSheet chapter={chapter} theme={theme} onClose={() => setOpen(false)} />}
    </>
  );
}

function ChapterSheet({ chapter, theme, onClose }: { chapter: ChapterDTO; theme: Theme; onClose: () => void }) {
  const t = useT();
  const c = THEMES[theme];
  const { index, total, reached } = chapter;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={t("shell.chapter.title")}>
      <button type="button" aria-label={t("shell.chapter.close")} className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative w-full max-w-md rounded-t-2xl border-t px-4 pt-3 ${c.panel}`}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <h2 className={`min-w-0 flex-1 text-xl ${c.title}`}>{t("shell.chapter.title")}</h2>
          <button type="button" onClick={onClose} className={`min-h-11 rounded-md px-3 text-sm text-stone-300 ${c.press}`}>
            {t("shell.chapter.close")}
          </button>
        </div>
        <p className={`mt-1 font-mono text-[11px] uppercase tracking-[0.2em] ${c.label}`}>{t("shell.chapter.of", { n: index, total })}</p>
        <ol className="mt-3 space-y-1.5">
          {Array.from({ length: total }, (_, i) => {
            const name = reached[i];
            const now = i === index - 1;
            return (
              <li key={i} className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 ${c.row} ${name ? "" : "border-dashed opacity-70"}`}>
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${name ? `${c.on} text-black/80` : `${c.off} ${c.muted}`}`}
                >
                  {name && !now ? "✓" : i + 1}
                </span>
                <span className={`min-w-0 flex-1 truncate ${name ? "font-serif text-[15px] text-stone-100" : `text-sm ${c.muted}`}`}>
                  {name ?? t("shell.chapter.ahead")}
                </span>
                {now && <span className={`shrink-0 text-xs ${c.label}`}>{t("shell.chapter.now")}</span>}
              </li>
            );
          })}
        </ol>
        <p className={`mt-3 text-xs ${c.muted}`}>{t("shell.chapter.note")}</p>
      </div>
    </div>
  );
}
