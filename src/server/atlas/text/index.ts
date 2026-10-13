import "server-only";
import type { Locale } from "@/i18n/config";
import en from "./en";

export type AtlasTextKey = keyof typeof en;
export type AtlasText = Partial<Record<AtlasTextKey, string>>;

/** Translations arrive once the English text settles (docs/ATLAS.md, build order); until then, English. */
const TEXT: Partial<Record<Locale, AtlasText>> = { en };

/** `T(key, values)`: a story string in the player's language (English if missing). */
export function atlasT(loc: Locale) {
  const t = TEXT[loc] ?? en;
  return (key: AtlasTextKey, values: Record<string, string | number> = {}) =>
    (t[key] ?? en[key]).replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

export type AT = ReturnType<typeof atlasT>;

/** A multi-line value as an array of lines. */
export const atlasLines = (T: AT, key: AtlasTextKey) => T(key).split("\n");
