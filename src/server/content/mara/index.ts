import "server-only";
import type { Locale } from "@/i18n/config";
import type { MaraText } from "./types";
import en from "./en";
import ko from "./ko";
import zhTW from "./zh-TW";
import es from "./es";
import ja from "./ja";
import ptBR from "./pt-BR";

const TEXT: Record<Locale, MaraText> = { en, ko, "zh-TW": zhTW, es, ja, "pt-BR": ptBR };

export function maraText(loc: Locale): MaraText {
  return TEXT[loc] ?? en;
}

/** "{a} and {b}" style fill-in for the catalog strings above. */
export function fill(s: string, values: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
}
