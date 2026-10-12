import "server-only";
import type { CloseupDTO, HotspotId, ItemDTO, ItemId, LockId } from "@/lib/train/types";

/**
 * The Nightingale Express, Room 1 (Compartment 12B): items, where they lie, the lock codes and every
 * line of text a close-up shows. English only while the game is in staging.
 * Design doc: "The Nightingale Express — design doc" (Claude Docs).
 */

export const LOCK_CODES: Record<LockId, string> = { suitcase: "247", door: "4196" };

const TELEGRAM_LINES = [
  "NIGHTINGALE CREW NOTICE STOP",
  "SLEEPER DOOR OVERRIDE IS STOP",
  "THE PLATFORM NUMBERS OF TONIGHTS STOPS",
  "AFTER MIDNIGHT IN ORDER STOP",
  "DESTROY AFTER READING",
];
const half = (line: string) => Math.ceil(line.length / 2);

interface ItemDef extends Omit<ItemDTO, "id"> {
  /** Lowercase phrase for the case log: "found a screwdriver". */
  logName: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  pouch: {
    name: "Velvet jewel pouch",
    logName: "an empty jewel pouch",
    description: "Dark blue velvet with a gold drawstring, and empty. It smells faintly of lily-of-the-valley.",
    evidence: true,
  },
  "washstand-key": {
    name: "Small brass key",
    logName: "a small brass key",
    description: "Tied to a paper tag that says \"washstand\".",
  },
  screwdriver: {
    name: "Screwdriver",
    logName: "a screwdriver",
    description: "A neat little screwdriver from Mrs. Lindqvist's tool roll.",
  },
  "telegram-left": {
    name: "Torn telegram (left half)",
    logName: "half of a torn telegram",
    description: "Torn straight down the middle.",
    reading: { title: "Telegram, left half", lines: TELEGRAM_LINES.map((l) => `${l.slice(0, half(l))}…`) },
  },
  "telegram-right": {
    name: "Torn telegram (right half)",
    logName: "the other half of a telegram",
    description: "Torn straight down the middle.",
    reading: { title: "Telegram, right half", lines: TELEGRAM_LINES.map((l) => `…${l.slice(half(l))}`) },
  },
  telegram: {
    name: "Telegram",
    logName: "the whole telegram",
    description: "Both halves, fitted together.",
    reading: { title: "Railway telegram", lines: TELEGRAM_LINES },
  },
  cufflink: {
    name: "Gold cufflink",
    logName: "a gold cufflink",
    description: "Heavy, expensive, and engraved with the initials R.C.",
    evidence: true,
  },
};

/** Where each item lies, and the flags that must be set before it can be seen and taken. */
export const ITEM_PLACES: Partial<Record<ItemId, { at: HotspotId; needs: string[] }>> = {
  pouch: { at: "under-berth", needs: [] },
  "washstand-key": { at: "coat", needs: ["coat.searched"] },
  screwdriver: { at: "suitcase", needs: ["suitcase.open"] },
  "telegram-left": { at: "suitcase", needs: ["suitcase.open"] },
  "telegram-right": { at: "vent", needs: ["vent.open"] },
  cufflink: { at: "vent", needs: ["vent.open"] },
};

export const MIRROR_LETTERS = "LOOK UP";

export const TIMETABLE = [
  ["Stop", "Time", "Platform"],
  ["Harbour City", "23:00", "2"],
  ["Elmsford", "23:52", "8"],
  ["Kessel", "01:30", "4"],
  ["Halden Junction", "02:47", "1"],
  ["Varna Pass", "04:15", "9"],
  ["The border", "06:00", "6"],
];

type Has = (flag: string) => boolean;

/** Close-up text and actions for a hotspot, given the room's flags. `takes` and `lock` are filled in by the caller. */
export function closeupText(id: HotspotId, has: Has): Omit<CloseupDTO, "takes" | "lock"> {
  switch (id) {
    case "window":
      return {
        title: "The window",
        lines: [
          "Rain streams sideways across the glass. Beyond it: black fields, and now and then the lamp of a level crossing flicking past.",
          "The window is bolted shut for the night.",
        ],
        actions: [],
      };
    case "newspaper":
      return {
        title: "The evening newspaper",
        lines: [],
        doc: {
          kind: "newspaper",
          masthead: "The Harbour City Courier",
          date: "Tuesday, 13 November 1934 · Evening edition",
          headline: "Countess to wear the Star of Varga at the Alpine Gala",
          column: [
            "The Countess Ilona Varga, never seen without her signature scent of lily-of-the-valley, boards the Nightingale Express tonight with the famous sapphire in her keeping.",
            "The stone was insured last Tuesday for a record sum. Also aboard is Mr. Roland Carrow, the assessor who will examine it before the gala.",
          ],
          timetableTitle: "The Nightingale Express · Tonight's stops",
          timetable: TIMETABLE,
        },
        actions: [],
      };
    case "teacup":
      return { title: "A cup of tea", lines: ["Stone cold, with a skin on top. Whoever brought it didn't knock."], actions: [] };
    case "door":
      if (has("door.open")) {
        return {
          title: "The compartment door",
          lines: ["The door stands open. The corridor beyond is dark and empty, and the train sways."],
          actions: [{ op: "go", label: "Step into the corridor" }],
        };
      }
      return {
        title: "The compartment door",
        lines: has("panel.open")
          ? [
              "The service plate is off. Behind it, set into the lock, is a four-wheel brass dial stamped CREW OVERRIDE.",
            ]
          : [
              "Locked from the corridor side. The handle won't budge.",
              "Next to it, a small brass service plate is held on by four screws.",
            ],
        actions: [],
      };
    case "coat":
      return has("coat.searched")
        ? { title: "Your coat", lines: ["A heavy wool overcoat. You've been through the pockets."], actions: [] }
        : {
            title: "Your coat",
            lines: ["A heavy wool overcoat hangs on the hook. The pockets bulge a little."],
            actions: [{ op: "search", label: "Search the pockets" }],
          };
    case "suitcase":
      return {
        title: "A strange suitcase",
        lines: has("suitcase.open")
          ? ["The lid is up. Knitting, a cardigan, a tin of peppermints… and a leather tool roll."]
          : ["Not yours. Brown leather, brass corners and a three-wheel combination lock. There's a luggage tag on the handle."],
        doc: { kind: "tag", lines: ["H. LINDQVIST · BERTH 12A", "Do NOT open before Halden!"] },
        actions: [],
      };
    case "pillow":
      return has("pillow.lifted")
        ? {
            title: "Under the pillow",
            lines: ["A wrapped mint, and a card in neat handwriting."],
            doc: { kind: "note", lines: ["Ring if you need anything at all.", "— Teodor, night porter"] },
            actions: [],
          }
        : { title: "The pillow", lines: ["Plumped, starched, and slightly lumpy."], actions: [{ op: "lift", label: "Lift the pillow" }] };
    case "under-berth":
      return { title: "Under the lower berth", lines: ["Dust, a lost button, and the faint smell of flowers."], actions: [] };
    case "lamp":
      return {
        title: "Reading lamp",
        lines: ["A brass reading lamp with a green glass shade."],
        actions: [{ op: "toggle", label: has("lamp.on") ? "Switch it off" : "Switch it on" }],
      };
    case "upper-berth":
      return { title: "The upper berth", lines: ["Made up, but nobody has slept in it tonight."], actions: [] };
    case "washstand":
      if (!has("washstand.open")) {
        return {
          title: "The washstand",
          lines: ["A walnut cabinet that folds down into a washbasin. It's locked; the keyhole is small and brass."],
          actions: [],
        };
      }
      return {
        title: "The washstand",
        lines: has("tap.hot")
          ? ["Hot water hisses into the little porcelain basin. Steam rises."]
          : ["A little porcelain basin with two taps, marked H and C."],
        actions: [has("tap.hot") ? { op: "cold", label: "Turn off the hot tap" } : { op: "hot", label: "Turn on the hot tap" }],
      };
    case "mirror":
      return has("tap.hot")
        ? {
            title: "The mirror",
            lines: ["Steam has clouded the glass, and letters show where someone once wrote on it with a finger."],
            doc: { kind: "mirror", fogged: true, letters: MIRROR_LETTERS },
            actions: [],
          }
        : {
            title: "The mirror",
            lines: ["An oval mirror in a brass frame. You look tired."],
            doc: { kind: "mirror", fogged: false },
            actions: [],
          };
    case "vent":
      return {
        title: "The ceiling vent",
        lines: has("vent.open")
          ? ["The grille hangs open on one screw. Someone has used this as a hiding place."]
          : ["A small brass grille in the ceiling above the mirror, held by two screws."],
        actions: [],
      };
    case "towel":
      return { title: "A towel", lines: ["Starched linen, embroidered with a small nightingale."], actions: [] };
  }
}
