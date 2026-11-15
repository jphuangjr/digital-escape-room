"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLocale } from "@/i18n/client";
import { EN_PACK, PACK_LOADERS, type ContentPack } from "@/lib/allhands/content";

/** Loads this phone's language pack (English until it arrives, or if it can't load). */
export function useLoadedPack(): ContentPack {
  const locale = useLocale();
  const [pack, setPack] = useState<ContentPack>(EN_PACK);
  useEffect(() => {
    const load = PACK_LOADERS[locale];
    if (!load) return setPack(EN_PACK);
    let live = true;
    load()
      .then((m) => live && setPack(m.default))
      .catch(() => live && setPack(EN_PACK));
    return () => {
      live = false;
    };
  }, [locale]);
  return pack;
}

export const PackContext = createContext<ContentPack>(EN_PACK);
export const usePack = () => useContext(PackContext);
