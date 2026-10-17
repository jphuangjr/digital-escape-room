import "server-only";
import type { Locale } from "@/i18n/config";
import en from "./en";
import es from "./es";
import ja from "./ja";
import ko from "./ko";
import ptBR from "./pt-BR";
import zhTW from "./zh-TW";

export type AtlasTextKey = keyof typeof en;
export type AtlasText = Record<AtlasTextKey, string>;

const TEXT: Record<Locale, AtlasText> = { en, ko, "zh-TW": zhTW, es, ja, "pt-BR": ptBR };

/** `T(key, values)`: a story string in the player's language (English if missing). */
export function atlasT(loc: Locale) {
  const t = TEXT[loc] ?? en;
  return (key: AtlasTextKey, values: Record<string, string | number> = {}) =>
    (t[key] ?? en[key]).replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

export type AT = ReturnType<typeof atlasT>;

/** A multi-line value as an array of lines. */
export const atlasLines = (T: AT, key: AtlasTextKey) => T(key).split("\n");
