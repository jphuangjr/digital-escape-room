import { describe, expect, it } from "vitest";
import en from "../text/en";
import es from "../text/es";
import ja from "../text/ja";
import ko from "../text/ko";
import ptBR from "../text/pt-BR";
import zhTW from "../text/zh-TW";

const LOCALES = { es, ja, ko, "pt-BR": ptBR, "zh-TW": zhTW } as Record<string, Record<string, string>>;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
// The Cartographers' glyphs carry the puzzles: every translation keeps all of them, and any run of them (an answer
// like "☾ ◈ ≈ ☉ ⌘ ✶ △") exactly, in order. Glyphs named one at a time in a sentence may move with the grammar.
const GLYPHS = "☉☾✶◈△≈⌘";
const glyphs = (s: string) => [...s].filter((c) => GLYPHS.includes(c)).sort().join("");
const runs = (s: string) => (s.match(new RegExp(`[${GLYPHS}](?:\\s*[${GLYPHS}])+`, "gu")) ?? []).map((r) => r.replace(/\s+/g, " "));
const lines = (s: string) => s.split("\n").length;

describe("the Atlas's text", () => {
  // Lines are split on real line breaks; a "{N}" was once used instead and showed up on screen.
  it("breaks lines with \\n, never a {N} placeholder", () => {
    for (const [loc, text] of Object.entries({ en, ...LOCALES })) {
      expect(Object.entries(text).filter(([, v]) => v.includes("{N}")).map(([k]) => k), loc).toEqual([]);
    }
  });

  for (const [loc, text] of Object.entries(LOCALES)) {
    describe(loc, () => {
      it("has exactly the English keys", () => {
        expect(Object.keys(text).sort()).toEqual(Object.keys(en).sort());
      });
      it("keeps every placeholder, glyph and line break", () => {
        for (const [k, v] of Object.entries(en)) {
          const tr = text[k];
          expect(placeholders(tr), `${loc} ${k} placeholders`).toEqual(placeholders(v));
          expect(glyphs(tr), `${loc} ${k} glyphs`).toEqual(glyphs(v));
          for (const run of runs(v)) expect(tr.replace(/\s+/g, " "), `${loc} ${k} keeps "${run}"`).toContain(run);
          expect(lines(tr), `${loc} ${k} lines`).toBe(lines(v));
        }
      });
    });
  }
});
