// Locale settings shared by server and client. Language is per player (cookie), never in the URL,
// so invite links and QR codes work for everyone.

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

/** Each language's name, written in that language (for the switcher). */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ko: "한국어" };

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (LOCALES as readonly string[]).includes(x);
}

/** Best supported locale for an Accept-Language header, e.g. "ko-KR,ko;q=0.9,en;q=0.8" -> "ko". */
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { base: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((x) => x.base && x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const { base } of ranked) if (isLocale(base)) return base;
  return DEFAULT_LOCALE;
}

/**
 * Story text in every language, used where the text lives in code instead of a catalog
 * (server content, client-side story files). Adding a locale makes every `Tr` fail typecheck
 * until it's translated.
 */
export type Tr = Record<Locale, string>;

/** `const x = pick(loc); x({ en: "…", ko: "…" })` */
export function pick(loc: Locale) {
  return (t: Tr): string => t[loc] ?? t.en;
}
