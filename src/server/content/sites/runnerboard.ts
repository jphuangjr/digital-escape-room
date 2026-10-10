import "server-only";
import type { Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const RUNNERBOARD_HOST = "runnerboard.net";

export interface ForumPost {
  author: string;
  date: string;
  time: string; // HH:MM
  body: string;
}

/** Real trail: compass_needle (LO ST PA WS). Decoy: needle_compass (TR AP DO OR). */
export const FORUM_THREADS: { title: string; posts: ForumPost[] }[] = [
  {
    title: "Circuit Runner '94 — all-time high score thread",
    posts: [
      { author: "pixel_marta", date: "Sep 29", time: "09:42", body: "Monthly reminder that the top of the board hasn't moved in five years. W.OKAFOR, 2,418,770. Nobody has come within a hundred thousand." },
      { author: "compass_needle", date: "Sep 30", time: "12:15", body: "She's earned it. Some people know where every wall is before the maze even loads. Ask her how and she'll just say she reads the level like a record." },
      { author: "turbo_gus", date: "Sep 30", time: "14:07", body: "Has anyone actually met W.OKAFOR? I'm starting to think it's a cabinet bug." },
      { author: "needle_compass", date: "Oct 1", time: "20:18", body: "Don't bother with her. If you're looking for answers, follow ME. I'll leave the trail in plain sight." },
      { author: "pixel_marta", date: "Oct 1", time: "21:50", body: "She's real. She just doesn't post anymore. Weird thing — her avatar went blank last month. Like someone scrubbed it." },
    ],
  },
  {
    title: "Off-topic: things that go missing",
    posts: [
      { author: "lagfox", date: "Oct 2", time: "08:33", body: "My third cartridge of Circuit Runner this year, gone from my car. Who steals a cartridge?" },
      { author: "compass_needle", date: "Oct 2", time: "19:20", body: "Not everything that goes missing is stolen. Some things leave on purpose. Some things are hiding in plain sight, waiting for the right person to ask." },
      { author: "needle_compass", date: "Oct 3", time: "01:16", body: "Things go missing because people ask too many questions. Stick with me and I'll show you where they all end up." },
      { author: "turbo_gus", date: "Oct 3", time: "10:05", body: "This thread got dark fast." },
    ],
  },
  {
    title: "Arcade cabinet restoration log (pics!)",
    posts: [
      { author: "solder_queen", date: "Oct 3", time: "11:48", body: "New marquee on the Runner cabinet. Took the old one down and found someone had scratched a little compass into the back panel. Seven notches. Broken needle. Creepy or cute?" },
      { author: "compass_needle", date: "Oct 4", time: "16:01", body: "Cute. Leave it. Somebody wanted to be remembered by whoever opened it up. Also — off topic — has anyone seen Biscuit? Little tabby, white socks, last seen near Harbour Street. She belongs to a friend who can't look for her right now." },
      { author: "needle_compass", date: "Oct 4", time: "04:15", body: "Forget the cat. I've got something better for you. Read my timestamps. That's where the door is." },
      { author: "solder_queen", date: "Oct 4", time: "18:22", body: "@compass_needle I'll keep an eye out for Biscuit. Post on the pet board, they're good." },
    ],
  },
  {
    title: "Speedrun routing: level 7 shortcut?",
    posts: [
      { author: "lagfox", date: "Oct 5", time: "13:37", body: "There's a gap in the level 7 wall if you hug the left side. Saves four seconds. Can't find it on any map." },
      { author: "needle_compass", date: "Oct 5", time: "15:18", body: "Every shortcut is a door if you know how to read it. Mine's the only one that opens." },
      { author: "compass_needle", date: "Oct 6", time: "23:19", body: "There's no shortcut on seven. The map was redrawn so you'd think there was. Trust the needle that points true, not the one that points back at you. If you're reading my posts, read the clock on them." },
      { author: "turbo_gus", date: "Oct 6", time: "23:58", body: "Why do you two have the same username backwards" },
    ],
  },
];

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Forum", href: RUNNERBOARD_HOST },
    { text: "High Scores", href: `${RUNNERBOARD_HOST}/scores` },
  ],
};

const FOOTER: Block = { type: "footer", text: "RunnerBoard — fan forum for Circuit Runner '94. Not affiliated with anyone who'd sue us. All times local." };

function home(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "RunnerBoard" },
    { type: "paragraph", text: "INSERT COIN. Discuss routes, cabinets, and the eternal question of who W.OKAFOR really is." },
  ];
  const inline: Record<number, string[]> = {};
  for (const t of FORUM_THREADS) {
    blocks.push({ type: "heading", level: 2, text: t.title });
    for (const p of t.posts) {
      if (p.author === "compass_needle") inline[blocks.length] = ["post-meta: user#0007 joined 2019"];
      if (p.author === "needle_compass") inline[blocks.length] = ["post-meta: user#1987x joined last week — ip: 10.19.78.4 (meridian-inst range?)"];
      blocks.push({ type: "post", title: `Re: ${t.title}`, author: p.author, date: p.date, time: p.time, body: p.body });
    }
  }
  blocks.push(FOOTER);
  return page(RUNNERBOARD_HOST, "RunnerBoard — Circuit Runner '94 Forum", "runnerboard", blocks, {
    headComments: ["phpBoard 2.0.4 (patched, mostly)"],
    inlineComments: inline,
    tailComments: ["mods: two accounts with mirrored names. one of them is a sock. figure out which before banning."],
  });
}

function scores(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "Circuit Runner '94 — Verified High Scores" },
    {
      type: "list",
      items: [
        "1. W.OKAFOR — 2,418,770",
        "2. PIXEL_MARTA — 2,301,115",
        "3. SOLDER_QUEEN — 2,288,040",
        "4. LAGFOX — 2,140,900",
        "5. TURBO_GUS — 1,998,600",
      ],
    },
    { type: "paragraph", text: "W.OKAFOR's profile picture is currently unavailable." },
    FOOTER,
  ];
  return page(`${RUNNERBOARD_HOST}/scores`, "High Scores — RunnerBoard", "runnerboard", blocks);
}

export function resolveRunnerboard(path: string, _progress: RoomProgress, _loc: Locale): SitePage | null {
  if (path === "") return home();
  if (path === "/scores") return scores();
  return null;
}
