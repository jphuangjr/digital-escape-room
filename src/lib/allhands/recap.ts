import type { NightRecord } from "./types";

/** One night of the recap, with who held each power: "The Moles (Chad, Ashley) went after Tyler." */
export function nightLines(n: NightRecord, name: (id: string | null) => string): string[] {
  const who = (ids: (string | null | undefined)[]) => {
    const names = ids.filter((x): x is string => Boolean(x)).map(name);
    if (names.length === 0) return "";
    return ` (${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0]})`;
  };
  const lines: string[] = [];
  const moles = `The ${n.moles && n.moles.length === 1 ? "Mole" : "Moles"}${who(n.moles ?? [])}`;
  if (n.moleTarget) lines.push(`${moles} went after ${name(n.moleTarget)}.`);
  else if (!n.offerTarget) lines.push(`${moles} didn't pick anyone.`);
  // A power whose holder was already gone that night is left out; older games don't know, so they only say what happened.
  const hr = `HR${who([n.hr])}`;
  if (n.hrTarget) lines.push(`${hr} covered ${name(n.hrTarget)}.`);
  else if (n.hr) lines.push(`${hr} didn't cover anyone.`);
  const it = `IT${who([n.it])}`;
  if (n.itTarget) lines.push(`${it} read ${name(n.itTarget)}'s DMs${n.itResult === null ? "" : n.itResult ? " (a Mole!)" : " (clean)"}.`);
  else if (n.it) lines.push(`${it} didn't read anyone's DMs.`);
  return lines;
}
