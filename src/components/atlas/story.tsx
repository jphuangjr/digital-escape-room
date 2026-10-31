"use client";

import { useEffect } from "react";
import type { AtlasItemDTO, ItemId } from "@/lib/atlas/types";
import { useT } from "@/i18n/client";
import { AtlasDocView } from "./parts";

/**
 * The story, made hard to miss: the three Cartographers' letters (one per Age) each get a card when found, with a
 * line saying what it means, and a section of their own in the notebook.
 */

export const LETTERS = ["memory-verdant", "memory-meridian", "memory-pelagic"] as const satisfies readonly ItemId[];
export type LetterId = (typeof LETTERS)[number];
export const isLetter = (id: string): id is LetterId => (LETTERS as readonly string[]).includes(id);

/** The letters the team holds, in story order. */
export const lettersHeld = (inventory: AtlasItemDTO[]) => LETTERS.flatMap((id) => inventory.filter((i) => i.id === id && i.reading));

/** A letter's text with the line saying what it means, as shown on the card and in the notebook. */
export function LetterView({ letter }: { letter: AtlasItemDTO }) {
  const t = useT();
  return (
    <>
      <AtlasDocView doc={{ kind: "note", lines: [letter.reading!.title, ...letter.reading!.lines] }} />
      <p className="rounded-lg border border-[#9fd3c7]/30 bg-[#0d2228] px-3 py-2 text-14px leading-relaxed text-stone-200">
        <span className="mb-0.5 block font-mono text-10px uppercase tracking-[0.25em] text-[#9fd3c7]">{t("atlas.story.meaning")}</span>
        {t(`atlas.story.recap.${letter.id}`)}
      </p>
    </>
  );
}

/** Shown when a letter is found: the letter, what it means, and how many of the three the team has now. */
export function LetterCard({ letter, held, onClose }: { letter: AtlasItemDTO; held: number; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 px-4 pb-6 pt-20" role="dialog" aria-modal="true" aria-label={letter.reading!.title}>
      <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-[#d8b56a]/50 bg-[#0b161b] p-5">
        <p className="font-mono text-11px uppercase tracking-[0.18em] text-[#9fd3c7]">{t("atlas.story.eyebrow", { n: held, total: LETTERS.length })}</p>
        <LetterView letter={letter} />
        {held === LETTERS.length && <p className="font-serif text-15px italic leading-relaxed text-[#f4e7b5]">{t("atlas.story.allThree")}</p>}
        <p className="text-xs text-stone-500">{t("atlas.story.kept")}</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 w-full rounded-lg bg-[#d8b56a] font-semibold text-[#14110a] active:bg-[#f4e7b5]"
        >
          {t("atlas.story.close")}
        </button>
      </div>
    </div>
  );
}
