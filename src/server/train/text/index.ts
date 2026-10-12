import "server-only";
import type { Locale } from "@/i18n/config";
import en from "./en";

export type TrainTextKey = keyof typeof en;
export type TrainText = Record<TrainTextKey, string>;

const TEXT: Partial<Record<Locale, TrainText>> = { en };

/** Register a translation (each locale file calls this from ./all). */
export function registerTrainText(loc: Locale, t: TrainText) {
  TEXT[loc] = t;
}

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
