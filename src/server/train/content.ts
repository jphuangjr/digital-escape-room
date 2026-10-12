import "server-only";
import type { CloseupDTO, HotspotId, ItemId, LockId, Suspect } from "@/lib/train/types";
import type { TT, TrainTextKey } from "./text";

/**
 * The Nightingale Express: where things are, the lock codes, the hint order and the endings. All the
 * words players read live in ./text/<locale>.ts; this file only says which key to show when.
 * Design doc: "The Nightingale Express — design doc" (Claude Docs).
 */

export const LOCK_CODES: Record<LockId, string> = { suitcase: "247", door: "4196", cashbox: "♦♠♣♥" };

/** Items that are evidence for the finale. */
export const EVIDENCE: ItemId[] = ["pouch", "cufflink", "scorecard", "powder", "bank-notice", "star"];

/** Items with something to read when held (title key + lines). */
const READINGS: Partial<Record<ItemId, { title: TrainTextKey; lines: (T: TT) => string[] }>> = {
  "telegram-left": { title: "item.telegram-left.title", lines: (T) => lines(T, "telegram.lines").map((l) => `${l.slice(0, half(l))}…`) },
  "telegram-right": { title: "item.telegram-right.title", lines: (T) => lines(T, "telegram.lines").map((l) => `…${l.slice(half(l))}`) },
  telegram: { title: "item.telegram.title", lines: (T) => lines(T, "telegram.lines") },
  scorecard: { title: "item.scorecard.title", lines: (T) => [...scoreRows(T).map(([suit, n]) => T("score.tricks", { suit, n })), "", T("score.note")] },
  powder: { title: "item.powder.title", lines: (T) => lines(T, "item.powder.lines") },
  "bank-notice": { title: "item.bank-notice.title", lines: (T) => lines(T, "item.bank-notice.lines") },
};

const half = (line: string) => Math.ceil(line.length / 2);
const lines = (T: TT, key: TrainTextKey) => T(key).split("\n");

const TRICKS = ["3", "1", "5", "2"]; // ♠ ♥ ♦ ♣
const scoreRows = (T: TT) => lines(T, "score.suits").map((suit, i) => [suit, TRICKS[i]]);

/** The words for an item, in the viewer's language. `held` adds what's written on it. */
export function itemText(id: ItemId, T: TT, opts: { held: boolean; peeled: boolean }) {
  const key = (k: string) => `item.${id}.${k}` as TrainTextKey;
  const peeled = id === "powder" && opts.peeled;
  const r = READINGS[id];
  return {
    name: T(key("name")),
    logName: T(key("log")),
    description: peeled ? T("item.powder.peeledDesc") : T(key("desc")),
    evidence: EVIDENCE.includes(id),
    reading:
      opts.held && r
        ? peeled
          ? { title: T("item.powder.peeledTitle"), lines: lines(T, "item.powder.peeledLines") }
          : { title: T(r.title), lines: r.lines(T) }
        : undefined,
  };
}

/** Where each item lies, and the flags that must be set before it can be seen and taken. */
export const ITEM_PLACES: Partial<Record<ItemId, { at: HotspotId; needs: string[] }>> = {
  pouch: { at: "under-berth", needs: [] },
  "washstand-key": { at: "coat", needs: ["coat.searched"] },
  screwdriver: { at: "suitcase", needs: ["suitcase.open"] },
  "telegram-left": { at: "suitcase", needs: ["suitcase.open"] },
  "telegram-right": { at: "vent", needs: ["vent.open"] },
  cufflink: { at: "vent", needs: ["vent.open"] },
  scorecard: { at: "bridge", needs: [] },
  keyring: { at: "cashbox", needs: ["cashbox.open"] },
  crank: { at: "cashbox", needs: ["cashbox.open"] },
  powder: { at: "stole", needs: ["stole.searched"] },
  "bank-notice": { at: "records", needs: ["records.searched"] },
  star: { at: "dumbwaiter", needs: ["dumbwaiter.raised"] },
};

/** Times and platforms never change between languages; only the station names do. */
const TIMES = ["23:00", "23:52", "01:30", "02:47", "04:15", "06:00"];
const PLATFORMS = ["2", "8", "4", "1", "9", "6"];

type Has = (flag: string) => boolean;
type Closeup = Omit<CloseupDTO, "takes" | "lock">;

/** Close-up text and actions for a hotspot, given the room's flags. `takes` and `lock` are filled in by the caller. */
export function closeupText(id: HotspotId, has: Has, T: TT): Closeup {
  const c = (k: string) => T(`c.${id}.${k}` as TrainTextKey);
  const L = (k: string) => lines(T, `c.${id}.${k}` as TrainTextKey);
  const simple = (): Closeup => ({ title: c("title"), lines: L("text"), actions: [] });
  switch (id) {
    case "window":
    case "teacup":
    case "under-berth":
    case "upper-berth":
    case "towel":
    case "bottles":
    case "sugar":
    case "champagne":
    case "kitchen-door":
    case "gramophone":
    case "dining-window":
      return simple();
    case "newspaper":
      return {
        title: c("title"),
        lines: [],
        doc: {
          kind: "newspaper",
          masthead: T("news.masthead"),
          date: T("news.date"),
          headline: T("news.headline"),
          column: lines(T, "news.column"),
          timetableTitle: T("tt.title"),
          timetable: [lines(T, "tt.head"), ...lines(T, "tt.stops").map((name, i) => [name, TIMES[i], PLATFORMS[i]])],
        },
        actions: [],
      };
    case "door":
      if (has("door.open")) return { title: c("title"), lines: L("open"), actions: [{ op: "go", label: c("go") }] };
      return { title: c("title"), lines: has("panel.open") ? L("panel") : L("locked"), actions: [] };
    case "coat":
      return has("coat.searched")
        ? { title: c("title"), lines: L("searched"), actions: [] }
        : { title: c("title"), lines: L("text"), actions: [{ op: "search", label: c("search") }] };
    case "suitcase":
      return {
        title: c("title"),
        lines: has("suitcase.open") ? L("open") : L("text"),
        doc: { kind: "tag", lines: lines(T, "tag.lines") },
        actions: [],
      };
    case "pillow":
      return has("pillow.lifted")
        ? { title: c("liftedTitle"), lines: L("lifted"), doc: { kind: "note", lines: lines(T, "pillow.note") }, actions: [] }
        : { title: c("title"), lines: L("text"), actions: [{ op: "lift", label: c("lift") }] };
    case "lamp":
      return { title: c("title"), lines: L("text"), actions: [{ op: "toggle", label: has("lamp.on") ? c("off") : c("on") }] };
    case "washstand":
      if (!has("washstand.open")) return { title: c("title"), lines: L("locked"), actions: [] };
      return {
        title: c("title"),
        lines: has("tap.hot") ? L("hot") : L("open"),
        actions: [has("tap.hot") ? { op: "cold", label: c("turnOff") } : { op: "hot", label: c("turnOn") }],
      };
    case "mirror":
      return has("tap.hot")
        ? { title: c("title"), lines: L("fogged"), doc: { kind: "mirror", fogged: true, letters: T("mirror.letters") }, actions: [] }
        : { title: c("title"), lines: L("text"), doc: { kind: "mirror", fogged: false }, actions: [] };
    case "vent":
      return { title: c("title"), lines: has("vent.open") ? L("open") : L("text"), actions: [] };
    case "bell":
      return has("bell.rung")
        ? { title: c("title"), lines: L("rung"), actions: [] }
        : { title: c("title"), lines: L("text"), actions: [{ op: "ring", label: c("ring") }] };
    case "cashbox":
      return has("cashbox.open")
        ? { title: c("title"), lines: L("open"), actions: [] }
        : { title: c("title"), lines: L("text"), doc: { kind: "engraving", text: T("cashbox.engraving") }, actions: [] };
    case "bridge":
      return {
        title: c("title"),
        lines: L("text"),
        doc: { kind: "scorecard", title: T("score.title"), rows: [lines(T, "score.head"), ...scoreRows(T)], note: T("score.note") },
        actions: [],
      };
    case "menu":
      return { title: c("title"), lines: [], doc: { kind: "chalk", title: T("menu.title"), lines: lines(T, "menu.lines") }, actions: [] };
    case "dumbwaiter":
      return { title: c("title"), lines: has("dumbwaiter.raised") ? L("raised") : has("dumbwaiter.open") ? L("open") : L("text"), actions: [] };
    case "records":
      return has("records.searched")
        ? { title: c("title"), lines: L("searched"), actions: [] }
        : { title: c("title"), lines: L("text"), actions: [{ op: "search", label: c("search") }] };
    case "stole":
      return has("stole.searched")
        ? { title: c("title"), lines: L("searched"), actions: [] }
        : { title: c("title"), lines: L("text"), actions: [{ op: "search", label: c("search") }] };
  }
}

// ---------- Teodor's notes (hints) ----------

export interface HintPuzzle {
  id: "suitcase" | "washstand" | "mirror" | "telegram" | "door" | "cashbox" | "dumbwaiter" | "evidence" | "bell" | "accuse";
  solved: (has: Has, found: (i: ItemId) => boolean) => boolean;
}

/** In rough play order; Teodor helps with the first one the team hasn't done. Words: hint.<id>.title / .1 .2 .3 */
export const HINT_PUZZLES: HintPuzzle[] = [
  { id: "suitcase", solved: (has) => has("suitcase.open") },
  { id: "washstand", solved: (has) => has("washstand.open") },
  { id: "mirror", solved: (has) => has("vent.open") },
  { id: "telegram", solved: (_has, found) => found("telegram") },
  { id: "door", solved: (has) => has("door.open") },
  { id: "cashbox", solved: (has) => has("cashbox.open") },
  { id: "dumbwaiter", solved: (_has, found) => found("star") },
  { id: "evidence", solved: (has, found) => has("bell.rung") || EVIDENCE.every(found) },
  { id: "bell", solved: (has) => has("bell.rung") },
  { id: "accuse", solved: () => false },
];

export const hintTitle = (T: TT, id: string) => T(`hint.${id}.title` as TrainTextKey);
export const hintText = (T: TT, id: string, tier: 1 | 2 | 3) => T(`hint.${id}.${tier}` as TrainTextKey);

/** Seconds between one note and the next on the same puzzle. */
export const HINT_COOLDOWN_SEC = 60;

// ---------- The finale ----------

export const THIEF: Suspect = "varga";

export const endingText = (T: TT, s: Suspect) => ({
  title: T(`end.${s}.title` as TrainTextKey),
  paragraphs: lines(T, `end.${s}.text` as TrainTextKey),
});
export const suspectName = (T: TT, s: Suspect) => T(`suspect.${s}` as TrainTextKey);
