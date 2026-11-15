"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/client";
import type { GruntCard } from "@/lib/grunt/cards";
import { CARD_PACK_LOADERS } from "@/lib/grunt/cardPacks";

const loaded = new Map<string, GruntCard[]>();

/** This phone's language's cards, or null for English (or until they've loaded). */
export function useCardPack(): GruntCard[] | null {
  const locale = useLocale();
  const [pack, setPack] = useState<GruntCard[] | null>(() => loaded.get(locale) ?? null);
  useEffect(() => {
    const load = CARD_PACK_LOADERS[locale];
    if (!load) return setPack(null);
    if (loaded.has(locale)) return setPack(loaded.get(locale)!);
    let live = true;
    load()
      .then((m) => {
        loaded.set(locale, m.default);
        if (live) setPack(m.default);
      })
      .catch(() => live && setPack(null));
    return () => {
      live = false;
    };
  }, [locale]);
  return pack;
}
