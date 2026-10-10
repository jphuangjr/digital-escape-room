import "server-only";
import type { Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { BINARY_PRACTICE_WORD, toBinary5 } from "../answers";
import { page } from "./source";

export const HARBOURCC_HOST = "harbourcc.edu";

const FOOTER: Block = { type: "footer", text: "Harbour Community College · Evening Studies · Doors open 6pm, coffee is not guaranteed." };

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Home", href: HARBOURCC_HOST },
    { text: "CS 110", href: `${HARBOURCC_HOST}/cs110` },
    { text: "Week 3: Binary", href: `${HARBOURCC_HOST}/cs110/binary` },
  ],
};

function home(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "Harbour Community College" },
    { type: "paragraph", text: "Evening Studies. Learn something after work." },
    { type: "heading", level: 2, text: "This term's evening courses" },
    {
      type: "list",
      items: [
        "CS 110: How Computers Count (Tuesdays, W. Okafor)",
        "HIST 204: The Harbour Before the Fire (Wednesdays, staff)",
        "ART 101: Drawing From Life (Thursdays, staff)",
      ],
    },
    { type: "link", text: "CS 110 course page →", href: `${HARBOURCC_HOST}/cs110` },
    { type: "notice", tone: "info", text: "HIST 204 is cancelled this term at the request of a community partner." },
    FOOTER,
  ];
  return page(HARBOURCC_HOST, "Harbour Community College", "harbourcc", blocks, {
    headComments: ["site maintained by the Evening Studies office. please stop emailing us about the parking."],
  });
}

function course(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "CS 110: How Computers Count" },
    { type: "paragraph", text: "Tuesdays, 6:30 to 8:30pm, Room 12. Instructor: W. Okafor (by day, a systems archivist; by night, this)." },
    { type: "heading", level: 2, text: "Lessons" },
    {
      type: "list",
      items: [
        "Week 1: What is a computer, really? (handout only)",
        "Week 2: Switches, on and off (handout only)",
        "Week 3: Binary, counting with two fingers (online lesson below)",
        "Week 4: Passwords, and why yours is bad (coming soon)",
      ],
    },
    { type: "link", text: "Week 3 lesson: Binary →", href: `${HARBOURCC_HOST}/cs110/binary` },
    { type: "paragraph", text: "Pass the Week 3 practice quiz and you can install the class Binary translator on your own machine." },
    FOOTER,
  ];
  return page(`${HARBOURCC_HOST}/cs110`, "CS 110: How Computers Count", "harbourcc", blocks, {
    bodyComments: ["attendance this term: 4. one of them is Ada, and she keeps asking about checksums. — W."],
  });
}

const SHEET_ROWS: string[][] = Array.from({ length: 26 }, (_, i) => [
  String.fromCharCode(65 + i),
  String(i + 1),
  (i + 1).toString(2).padStart(5, "0"),
]);

function lesson(progress: RoomProgress): SitePage {
  const passed = progress.solved.includes("binary-lesson");
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "Week 3: Binary" },
    { type: "paragraph", text: "Computers only have two fingers: a switch is either off (0) or on (1). So instead of counting in tens, they count in twos." },
    { type: "heading", level: 2, text: "Place values" },
    { type: "paragraph", text: "In our class code every letter is five switches. From left to right the switches are worth 16, 8, 4, 2 and 1. Add up the values of the switches that are on. That number is the letter: A is 1, B is 2, all the way to Z at 26." },
    { type: "paragraph", text: "Worked example: 01000. Only the 8 switch is on, so it's 8, and the 8th letter is H. Another: 10011 is 16 + 2 + 1 = 19, which is S." },
    { type: "heading", level: 2, text: "Try it" },
    { type: "paragraph", text: "Tap the switches to turn them on and off." },
    { type: "bits" },
    { type: "heading", level: 2, text: "Decoding sheet" },
    { type: "table", caption: "Class code: one letter, five bits", columns: ["Letter", "Number", "Binary"], rows: SHEET_ROWS },
    { type: "heading", level: 2, text: "Practice quiz" },
    passed
      ? { type: "notice", tone: "success", text: "Quiz passed. The class Binary translator is installed in your Decoder." }
      : { type: "paragraph", text: "Decode this word with the sheet, then type it in. Pass and the class Binary translator installs on your machine." },
    { type: "form", form: "binary-quiz", prompt: toBinary5(BINARY_PRACTICE_WORD) },
    FOOTER,
  ];
  return page(`${HARBOURCC_HOST}/cs110/binary`, "Week 3: Binary", "harbourcc", blocks, {
    bodyComments: ["yes, real computers use 8 bits and a different table. this is a class, not a job. — W.O."],
  });
}

export function resolveHarbourcc(path: string, progress: RoomProgress, _loc: Locale): SitePage | null {
  if (path === "") return home();
  if (path === "/cs110") return course();
  if (path === "/cs110/binary") return lesson(progress);
  return null;
}
