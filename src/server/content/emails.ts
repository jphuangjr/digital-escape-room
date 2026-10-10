import "server-only";
import type { Locale } from "@/i18n/config";
import type { EmailDTO, HintDTO, RoomProgress } from "@/lib/types";
import { HINT_PUZZLES, HINT_TITLES } from "./hints";

const SISTER = "Mara Voss <mara.voss@harbourmail.net>";
const ADA = "Ada Voss";

export function baseEmails(_loc: Locale): EmailDTO[] {
  return [
    {
      id: "email-ada-last",
      from: "Ada Voss <ada@ada-voss.net>",
      subject: "(no subject)",
      date: "2 days ago, 23:57",
      kind: "email",
      body: [
        "If you're reading this, I got too close. Start at the beginning.",
        "",
        "meridian-inst.net",
        "",
        "— A.",
        "",
        "P.S. Pack my tools before you go anywhere. They're in Files on this laptop, locked the way family locks things. Mara will tell you more than she means to.",
      ].join("\n"),
    },
    {
      id: "email-sister-engagement",
      from: SISTER,
      subject: "The job — and some news I didn't want to share like this",
      date: "Yesterday, 08:14",
      kind: "email",
      body: [
        "Hi,",
        "",
        "Thank you for taking this on. I know the police think it's nothing. They keep saying 'grown woman, extended leave, she'll turn up'. The Institute said the same, in exactly the same words, which is half the reason I don't believe them.",
        "",
        "Ada and I haven't really spoken in two years. It was a stupid fight about our father's papers. She thought he'd been mixed up in something at the harbour; I told her she was seeing ghosts in ledgers. I'd give anything to have that conversation back.",
        "",
        "The other reason I'm writing — I'm getting married. Tom proposed last month, and we've booked the party for March 14. That's Ada's birthday. I picked it on purpose. I thought if I invited her on her own birthday she couldn't say no. She should be at my engagement party on her birthday, March 14, laughing at Tom's terrible speech. She has to be there.",
        "",
        "I've forwarded you her last email. I've given you her laptop login. Whatever you find, please tell me the truth. Even if it's bad.",
        "",
        "Mara",
      ].join("\n"),
    },
    {
      id: "email-institute-pr",
      from: "Office of the Director, Meridian Institute <press@meridian-inst.net>",
      subject: "Statement regarding Dr. A. Voss",
      date: "Yesterday, 16:02",
      kind: "email",
      body: [
        "Dear enquirer,",
        "",
        "The Meridian Institute is aware of speculation concerning our colleague Dr. Ada Voss. We can confirm that Dr. Voss is on extended leave for personal reasons. We ask that her privacy, and that of her family, be respected.",
        "",
        "The Institute's records are complete, verified and final. We do not comment on rumours.",
        "",
        "With continuity,",
        "The Office of the Director",
      ].join("\n"),
    },
  ];
}

interface Ambient {
  id: string;
  when: (p: RoomProgress) => boolean;
  subject: string;
  body: string;
}

const AMBIENT: Ambient[] = [
  {
    id: "vm-ambient-drift",
    when: (p) => p.visitedSites.some((s) => s.startsWith("thedrift.blog")),
    subject: "Voicemail — 0:31",
    body: "[static] ...you found the notebook. Good. I wrote it in order so someone could follow me. Don't let the recipes distract you — those were for Mara. [click]",
  },
  {
    id: "vm-ambient-trapdoor",
    when: (p) => p.visitedSites.some((s) => s.startsWith("trapdoor.net")),
    subject: "Voicemail — 0:18",
    body: "[wind] They built that door for people like you. Don't take it personally. Go back to the forum. My needle points true; theirs only points back at them. [click]",
  },
  {
    id: "vm-ambient-decoded",
    when: (p) => p.solved.includes("shift-key"),
    subject: "Voicemail — 0:44",
    body: "[keyboard clatter] Seven notches. You turned the dial. Wren has the key — she gave it to me when she realised they'd erased her face. The vault code is the year they lied. Look at the bottom of their pages, where nobody reads. [click]",
  },
  {
    id: "vm-ambient-inside",
    when: (p) => p.solved.includes("intranet-login"),
    subject: "Voicemail — 1:02",
    body: "[server hum] You're inside. I'm sorry about what you're seeing in that log. Founding years, warehouse fires, my father's name. It's all real, and it's all been sanded off. The memo about me is in the admin console. Wren left the password on the dashboard, in ones and zeros. She taught me to read them. [click]",
  },
  {
    id: "vm-ambient-admin",
    when: (p) => p.solved.includes("admin-console"),
    subject: "Voicemail — 0:31",
    body: "[a laugh, barely] Five bits a letter. Wren would give you a gold star. Lamps in the Trust office, the night of the fire. She never forgot that line either. There's a memo in there with my name on it. Tap through the black bars. [click]",
  },
  {
    id: "vm-ambient-alive",
    when: (p) => p.solved.includes("final-phrase"),
    subject: "Voicemail — 0:52",
    body: "[a breath, close to the phone] Hi. It's really me. Not a recording this time. Thank you. Now — you and the people with you get to decide what happens next. I'll live with it either way. [click]",
  },
];

export function voicemailsFor(progress: RoomProgress, hints: HintDTO[], _loc: Locale): EmailDTO[] {
  const out: EmailDTO[] = [];
  for (const a of AMBIENT) {
    if (a.when(progress)) out.push({ id: a.id, from: ADA, subject: a.subject, date: "Unknown number", body: a.body, kind: "voicemail" });
  }
  const sorted = [...hints].sort(
    (x, y) =>
      x.unlockedAt.localeCompare(y.unlockedAt) ||
      HINT_PUZZLES.indexOf(x.puzzleId) - HINT_PUZZLES.indexOf(y.puzzleId) ||
      x.tier - y.tier,
  );
  for (const h of sorted) {
    out.push({
      id: `vm-hint-${h.puzzleId}-${h.tier}`,
      from: ADA,
      subject: `Voicemail: ${HINT_TITLES[h.puzzleId] ?? h.puzzleId} (${h.tier}/3)`,
      date: formatWhen(h.unlockedAt),
      body: `[recording] ${h.text} [click]`,
      kind: "voicemail",
    });
  }
  return out;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown number";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `Unknown number · ${hh}:${mm}`;
}
