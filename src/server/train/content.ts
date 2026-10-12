import "server-only";
import type { CloseupDTO, HotspotId, ItemDTO, ItemId, LockId, Suspect } from "@/lib/train/types";

/**
 * The Nightingale Express, Room 1 (Compartment 12B): items, where they lie, the lock codes and every
 * line of text a close-up shows. English only while the game is in staging.
 * Design doc: "The Nightingale Express — design doc" (Claude Docs).
 */

export const LOCK_CODES: Record<LockId, string> = { suitcase: "247", door: "4196", cashbox: "♦♠♣♥" };

const TELEGRAM_LINES = [
  "NIGHTINGALE CREW NOTICE STOP",
  "SLEEPER DOOR OVERRIDE IS STOP",
  "THE PLATFORM NUMBERS OF TONIGHTS STOPS",
  "AFTER MIDNIGHT IN ORDER STOP",
  "DESTROY AFTER READING",
];
const half = (line: string) => Math.ceil(line.length / 2);

const SCORECARD_ROWS = [
  ["Suit", "Tricks"],
  ["♠ Spades", "3"],
  ["♥ Hearts", "1"],
  ["♦ Diamonds", "5"],
  ["♣ Clubs", "2"],
];
const SCORECARD_NOTE = "Partner: back in ten minutes. I.V., 00:15";

interface ItemDef extends Omit<ItemDTO, "id" | "actions"> {
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
  scorecard: {
    name: "Bridge scorecard",
    logName: "the bridge scorecard",
    description: "From Table 3. Tricks won tonight, and a note in a looping hand.",
    evidence: true,
    reading: { title: "Bridge scorecard, Table 3", lines: [...SCORECARD_ROWS.slice(1).map((r) => `${r[0]}: ${r[1]} tricks`), "", SCORECARD_NOTE] },
  },
  keyring: {
    name: "Steward's key ring",
    logName: "the steward's key ring",
    description: "Three keys on a brass ring. One is stamped DUMBWAITER.",
  },
  crank: {
    name: "Crank handle",
    logName: "a brass crank handle",
    description: "A brass crank with a square end, made to fit a winding socket.",
  },
  powder: {
    name: "Sleeping powder",
    logName: "a bottle of sleeping powder",
    description: "A little brown bottle, half empty. The label is lifting at one corner.",
    evidence: true,
    reading: { title: "The label", lines: ["SLEEPING POWDER", "Mr. R. Carrow", "One dose at bedtime.", "Dr. A. Osei"] },
  },
  "bank-notice": {
    name: "Bank notice",
    logName: "a letter from Kessel Bank",
    description: "Folded small and hidden in a record sleeve.",
    evidence: true,
    reading: {
      title: "Kessel Bank · Final notice",
      lines: [
        "To: Countess Ilona Varga",
        "Your account stands 412,000 crowns overdrawn.",
        "The Bank will proceed against the Varga estate on 1 December unless the sum is settled in full.",
      ],
    },
  },
  star: {
    name: "The Star of Varga",
    logName: "the Star of Varga",
    description: "A sapphire the size of a quail's egg, wrapped in a lady's evening glove embroidered I.V.",
    evidence: true,
  },
};

/** The powder's label once peeled back: the original underneath. */
export const POWDER_PEELED = {
  title: "The label, peeled back",
  lines: ["SLEEPING POWDER", "Countess I. Varga", "One dose at bedtime.", "Dr. A. Osei", "", "(A newer label saying \"Mr. R. Carrow\" had been stuck over it.)"],
};

export const EVIDENCE: ItemId[] = ["pouch", "cufflink", "scorecard", "powder", "bank-notice", "star"];

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

    // ---------- the dining car ----------
    case "bell":
      return {
        title: "The service bell",
        lines: has("bell.rung")
          ? ["The conductor and Teodor are here. Everyone is waiting for you to name the thief."]
          : ["A brass bell on the bar, and a card beside it: \"Ring for the steward.\""],
        actions: has("bell.rung") ? [] : [{ op: "ring", label: "Ring the bell" }],
      };
    case "cashbox":
      return {
        title: "The cash box",
        lines: has("cashbox.open")
          ? ["The lid is up. Under the steward's float: a key ring and a brass crank handle."]
          : ["A steel cash box bolted to the bar. Its lock has four wheels, each stamped with the card suits."],
        doc: has("cashbox.open") ? undefined : { kind: "engraving", text: "Most tricks first." },
        actions: [],
      };
    case "bottles":
      return { title: "Behind the bar", lines: ["Cognac, kirsch, and a bottle of Tokaji with two inches left. Nothing hidden behind them."], actions: [] };
    case "bridge":
      return {
        title: "Table 3",
        lines: [
          "A bridge game abandoned mid-hand: four hands face up on the cloth.",
          "Name cards: Countess Varga · Mr. Carrow · Dr. Osei · Mrs. Lindqvist.",
        ],
        doc: { kind: "scorecard", title: "Scorecard · tricks won tonight", rows: SCORECARD_ROWS, note: SCORECARD_NOTE },
        actions: [],
      };
    case "sugar":
      return {
        title: "The sugar bowl",
        lines: ["At Mr. Carrow's place. Next to it, a little spill of fine white powder that isn't sugar."],
        actions: [],
      };
    case "champagne":
      return { title: "A champagne glass", lines: ["At the Countess's place, with a crescent of red lipstick on the rim."], actions: [] };
    case "menu":
      return {
        title: "The menu board",
        lines: [],
        doc: { kind: "chalk", title: "Tonight", lines: ["Consommé", "Trout meunière", "Tournedos Rossini", "Crêpes Suzette", "", "Kitchen closed after 23:30. — Steward"] },
        actions: [],
      };
    case "dumbwaiter":
      if (has("dumbwaiter.raised")) {
        return { title: "The dumbwaiter", lines: ["The little lift has creaked up into view."], actions: [] };
      }
      return {
        title: "The dumbwaiter",
        lines: has("dumbwaiter.open")
          ? ["The hatch is open. The lift is stuck between floors, its tray just out of reach below. There's a square winding socket beside the hatch."]
          : ["A small service lift down to the kitchen. The hatch has a steward's lock, and beside it is a square winding socket."],
        actions: [],
      };
    case "kitchen-door":
      return { title: "The kitchen door", lines: ["Locked. A sign says KITCHEN CLOSED. Someone is snoring on the other side."], actions: [] };
    case "gramophone":
      return { title: "The gramophone", lines: ["A walnut gramophone with a brass horn. The record has run out and the needle hisses in the groove."], actions: [] };
    case "records":
      return has("records.searched")
        ? { title: "The records", lines: ["Mostly dance bands. The sleeve of \"The Nightingale Waltz\" was hiding something."], actions: [] }
        : { title: "The records", lines: ["A stack of records in paper sleeves."], actions: [{ op: "search", label: "Look through the records" }] };
    case "stole":
      return has("stole.searched")
        ? { title: "The fur stole", lines: ["Silver fox, faintly scented with lily-of-the-valley. Its pockets are empty now."], actions: [] }
        : {
            title: "The fur stole",
            lines: ["A silver fox stole on the coat stand, faintly scented with lily-of-the-valley. Something weighs down one pocket."],
            actions: [{ op: "search", label: "Check the pockets" }],
          };
    case "dining-window":
      return {
        title: "The window",
        lines: ["Snow now, not rain. The mountains are close. A sign flashes past: VARNA PASS. Less than two hours to the border."],
        actions: [],
      };
  }
}

// ---------- Teodor's notes (hints) ----------

export interface HintPuzzle {
  id: string;
  title: string;
  solved: (has: Has, found: (i: ItemId) => boolean) => boolean;
  tiers: [string, string, string];
}

/** In rough play order; Teodor helps with the first one the team hasn't done. */
export const HINT_PUZZLES: HintPuzzle[] = [
  {
    id: "suitcase",
    title: "The strange suitcase",
    solved: (has) => has("suitcase.open"),
    tiers: [
      "That isn't your suitcase. Read the tag on its handle.",
      "\"Don't open before Halden.\" The evening paper prints tonight's timetable on the back page.",
      "Halden Junction is at 02:47. The suitcase code is 2 4 7.",
    ],
  },
  {
    id: "washstand",
    title: "The washstand",
    solved: (has) => has("washstand.open"),
    tiers: [
      "The washstand is locked, and your coat isn't empty.",
      "Search the coat by the door: there's a small brass key in the pocket.",
      "Take the brass key from the coat, open the washstand and use the key on it.",
    ],
  },
  {
    id: "mirror",
    title: "The mirror",
    solved: (has) => has("vent.open"),
    tiers: [
      "Little washrooms steam up quickly. Try the hot tap.",
      "Run the hot tap and look at the mirror: someone wrote on it. Read it backwards.",
      "It says LOOK UP: the ceiling vent above the mirror. Use the screwdriver from the suitcase on it.",
    ],
  },
  {
    id: "telegram",
    title: "The telegram",
    solved: (_has, found) => found("telegram"),
    tiers: [
      "Half a telegram is half a message.",
      "The other half was hidden in the ceiling vent. Put the two halves together.",
      "Tap one half under Your things, then pick the other half under Combine with.",
    ],
  },
  {
    id: "door",
    title: "The compartment door",
    solved: (has) => has("door.open"),
    tiers: [
      "The door's service plate is held on by screws, and you have a screwdriver.",
      "Behind the plate is a four-wheel dial. The telegram says: the platforms of tonight's stops after midnight, in order. The timetable is on the back of the newspaper.",
      "After midnight: Kessel (4), Halden Junction (1), Varna Pass (9), the border (6). The code is 4 1 9 6.",
    ],
  },
  {
    id: "cashbox",
    title: "The cash box",
    solved: (has) => has("cashbox.open"),
    tiers: [
      "Through the corridor is the dining car. The cash box on the bar takes card suits, and someone left a card game on Table 3.",
      "The lid says \"Most tricks first\". The scorecard on Table 3 lists the tricks won in each suit.",
      "Order the suits by tricks, most first: ♦ 5, ♠ 3, ♣ 2, ♥ 1. Set the wheels to ♦ ♠ ♣ ♥.",
    ],
  },
  {
    id: "dumbwaiter",
    title: "The dumbwaiter",
    solved: (_has, found) => found("star"),
    tiers: [
      "The steward's keys open something in this car, and the crank winds something.",
      "The dumbwaiter hatch next to the menu board: unlock it with the key ring, then wind it up with the crank.",
      "Use the key ring on the dumbwaiter, then use the crank on it, then take what's inside.",
    ],
  },
  {
    id: "evidence",
    title: "The whole story",
    solved: (has, found) => has("bell.rung") || EVIDENCE.every(found),
    tiers: [
      "Before you ring for the conductor, make sure you have the whole story: fur, records, labels.",
      "Check the pockets of the fur stole, look through the gramophone records, and look closely at labels.",
      "Take the sleeping powder from the stole and peel its label back (open it under Your things). The sleeve of \"The Nightingale Waltz\" hides a bank letter.",
    ],
  },
  {
    id: "bell",
    title: "Calling the conductor",
    solved: (has) => has("bell.rung"),
    tiers: ["You have the Star. Time to call for help.", "Ring the brass bell on the bar.", "Ring the bell on the bar to bring the conductor, then name the thief together."],
  },
  {
    id: "accuse",
    title: "Naming the thief",
    solved: () => false,
    tiers: [
      "Who gains if the Star disappears?",
      "The pouch's scent, the 00:15 note on the scorecard, the real name under the powder label and the bank letter all point the same way.",
      "The Countess staged the theft of her own sapphire for the insurance. Accuse Countess Varga.",
    ],
  },
];

/** Seconds between one note and the next on the same puzzle. */
export const HINT_COOLDOWN_SEC = 60;

// ---------- The finale ----------

export const THIEF: Suspect = "varga";

export const ENDINGS: Record<Suspect, { title: string; paragraphs: string[] }> = {
  varga: {
    title: "Case solved",
    paragraphs: [
      "At six the Nightingale Express sighs to a stop at the border. The conductor meets the police on the platform with a velvet tray: a sapphire, a glove, a pouch, a bottle with two labels, a bank letter and a bridge scorecard.",
      "The Countess Varga laughs at first. Then she sees the bank letter, upside down across the table, and stops laughing. The insurance claim she wired from Halden is still waiting in the telegraph office.",
      "Mr. Carrow wakes with a headache and a story he will tell for the rest of his life. Teodor is made head porter. Mrs. Lindqvist asks for her screwdriver back.",
    ],
  },
  carrow: {
    title: "The wrong man",
    paragraphs: [
      "Roland Carrow is led off the train at the border, groggy and protesting, his cufflink in an evidence bag.",
      "The Countess files her insurance claim from the Alpine Gala, wearing a new necklace. Months later a postcard arrives with no return address: \"You were so close. — T.\"",
    ],
  },
  osei: {
    title: "The wrong suspect",
    paragraphs: [
      "Dr. Osei admits to writing the prescription and is held for questioning at the border. The Countess's lawyers do the rest.",
      "By spring the Star of Varga is listed as lost, the insurance has paid out, and the Varga estate's debts are quietly settled.",
    ],
  },
  lindqvist: {
    title: "Very much the wrong suspect",
    paragraphs: [
      "Mrs. Lindqvist is outraged, then delighted: it is the most exciting thing that has ever happened to her, and she tells the border police all about it, twice.",
      "In the confusion, the Countess Varga steps off the train with a very light handbag. The Star is never seen again.",
    ],
  },
};
