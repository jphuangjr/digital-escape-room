import "server-only";
import type { Locale } from "@/i18n/config";
import en from "./en";
import es from "./es";
import ja from "./ja";
import ko from "./ko";
import ptBR from "./pt-BR";
import zhTW from "./zh-TW";

export type TrainTextKey = keyof typeof en;
export type TrainText = Record<TrainTextKey, string>;

const TEXT: Record<Locale, TrainText> = { en, ko, "zh-TW": zhTW, es, ja, "pt-BR": ptBR };

/** `T(key, values)`: a story string in the player's language (English if missing). */
export function trainT(loc: Locale) {
  const t = TEXT[loc] ?? en;
  return (key: TrainTextKey, values: Record<string, string | number> = {}) =>
    (t[key] ?? en[key]).replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** A multi-line value as an array of lines. */
export function trainLines(loc: Locale) {
  const T = trainT(loc);
  return (key: TrainTextKey) => T(key).split("\n");
}

export type TT = ReturnType<typeof trainT>;
