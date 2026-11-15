import type { NightRecord } from "./types";

type Translate = (id: string, values?: Record<string, string | number>) => string;

/** One night of the recap, with who held each power: "The Moles (Chad and Ashley) went after Tyler." */
export function nightLines(n: NightRecord, name: (id: string | null) => string, t: Translate): string[] {
  const who = (ids: (string | null | undefined)[]) => {
    const names = ids.filter((x): x is string => Boolean(x)).map(name);
    if (names.length === 0) return "";
    return t("allhands.recap.who", { names: names.reduce((a, b) => t("party.and", { a, b })) });
  };
  const lines: string[] = [];
  const moles = { n: n.moles?.length ?? 2, who: who(n.moles ?? []) };
  if (n.moleTarget) lines.push(t("allhands.recap.molesWent", { ...moles, name: name(n.moleTarget) }));
  else if (!n.offerTarget) lines.push(t("allhands.recap.molesNone", moles));
  // A power whose holder was already gone that night is left out; older games don't know, so they only say what happened.
  if (n.hrTarget) lines.push(t("allhands.recap.hrCovered", { who: who([n.hr]), name: name(n.hrTarget) }));
  else if (n.hr) lines.push(t("allhands.recap.hrNone", { who: who([n.hr]) }));
  if (n.itTarget) {
    const result = n.itResult === null ? "unknown" : n.itResult ? "mole" : "clean";
    lines.push(t("allhands.recap.itRead", { who: who([n.it]), name: name(n.itTarget), result }));
  } else if (n.it) lines.push(t("allhands.recap.itNone", { who: who([n.it]) }));
  return lines;
}
