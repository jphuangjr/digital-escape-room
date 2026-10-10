import { describe, expect, it } from "vitest";
import { IntlMessageFormat } from "intl-messageformat";
import { pickLocale } from "../config";
import { MESSAGES } from "../messages";

/** Argument and tag names used by an ICU message, e.g. "{count, plural, ...} <b>x</b>" -> ["b", "count"]. */
function argNames(msg: string): string[] {
  const names = new Set<string>();
  const walk = (els: unknown[]) => {
    for (const el of els as { type: number; value?: string; children?: unknown[]; options?: Record<string, { value: unknown[] }> }[]) {
      if (el.value && el.type !== 0 && el.type !== 7) names.add(el.value);
      if (el.children) walk(el.children);
      if (el.options) for (const o of Object.values(el.options)) walk(o.value);
    }
  };
  walk(new IntlMessageFormat(msg, "en").getAst());
  return [...names].sort();
}

describe("message catalogs", () => {
  it("every locale has exactly the English ids", () => {
    const ids = Object.keys(MESSAGES.en).sort();
    for (const [locale, msgs] of Object.entries(MESSAGES)) expect(Object.keys(msgs).sort(), locale).toEqual(ids);
  });
  it("every message parses and uses the same arguments as English", () => {
    for (const [locale, msgs] of Object.entries(MESSAGES)) {
      for (const [id, msg] of Object.entries(msgs)) {
        expect(() => new IntlMessageFormat(msg, locale), `${locale} ${id}`).not.toThrow();
        expect(argNames(msg), `${locale} ${id}`).toEqual(argNames(MESSAGES.en[id]));
      }
    }
  });
});

describe("pickLocale", () => {
  it("honours q-values and falls back to English", () => {
    expect(pickLocale("ko-KR,ko;q=0.9,en;q=0.8")).toBe("ko");
    expect(pickLocale("en-US,en;q=0.9,ko;q=0.8")).toBe("en");
    expect(pickLocale("fr-FR,ko;q=0.5")).toBe("ko");
    expect(pickLocale("fr-FR")).toBe("en");
    expect(pickLocale("zh-TW,zh;q=0.9")).toBe("zh-TW");
    expect(pickLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
    expect(pickLocale("ja-JP,ja;q=0.9")).toBe("ja");
    expect(pickLocale("zh-Hant-HK")).toBe("zh-TW");
    expect(pickLocale("zh-CN,en;q=0.5")).toBe("zh-TW");
    expect(pickLocale(null)).toBe("en");
  });
});
