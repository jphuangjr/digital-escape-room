"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/client";
import { REPLY_PACK_LOADERS, type ReplyPack } from "@/lib/replyall/content";

const loaded = new Map<string, ReplyPack>();

/** This phone's language's Reply All cards, or null for English (or until they've loaded). */
export function useReplyPack(): ReplyPack | null {
  const locale = useLocale();
  const [pack, setPack] = useState<ReplyPack | null>(() => loaded.get(locale) ?? null);
  useEffect(() => {
    const load = REPLY_PACK_LOADERS[locale];
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
