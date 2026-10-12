// Usage: node check-train-i18n.mjs <locale>  — checks a translation has every key, the same {placeholders},
// and the same line counts where the code depends on them.
import fs from "node:fs";
const loc = process.argv[2];
const load = (p) => {
  const src = fs.readFileSync(p, "utf8");
  const body = src.slice(src.indexOf("{", src.indexOf("= {")), src.lastIndexOf("}") + 1);
  return Function(`return (${body.replace(/as const;?\s*$/, "")})`)();
};
let bad = 0;
for (const [en, tr] of [
  ["src/server/train/text/en.ts", `src/server/train/text/${loc}.ts`],
  ["src/i18n/messages/en/train.ts", `src/i18n/messages/${loc}/train.ts`],
]) {
  const E = load(en), T = load(tr);
  for (const k of Object.keys(E)) {
    if (!(k in T)) { console.log("MISSING", tr, k); bad++; continue; }
    const ph = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    if (ph(E[k]) !== ph(T[k])) { console.log("PLACEHOLDERS", k, ph(E[k]), "vs", ph(T[k])); bad++; }
    if (T[k] === E[k] && /[a-z]{4}/.test(E[k]) && !/^(train\.spot|site\.game)/.test(k)) console.log("UNTRANSLATED?", k);
  }
  for (const k of ["tt.head", "tt.stops", "score.head", "score.suits", "telegram.lines", "tag.lines"]) {
    if (k in E && E[k].split("\n").length !== T[k].split("\n").length) { console.log("LINES", k); bad++; }
  }
}
for (const c of ["♠", "♥", "♦", "♣"]) if (!load(`src/server/train/text/${loc}.ts`)["score.suits"].includes(c)) { console.log("SUIT", c); bad++; }
console.log(bad ? `${bad} problem(s)` : "OK");
