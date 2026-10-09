import "server-only";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const DRIFT_HOST = "thedrift.blog";

export interface DriftPost {
  slug: string;
  title: string;
  date: string;
  series: "Field Notes" | "Ada's Kitchen";
  body: string;
}

/**
 * Displayed newest first, with the kitchen series interleaved.
 * Field Notes, read oldest to newest: titles start D, R, I, F, T; days-of-month 2,1,1,2,1 (sum 7).
 * Ada's Kitchen: the only digits in the bodies are measurements, which sum to 11 (decoy).
 */
export const DRIFT_POSTS: DriftPost[] = [
  {
    slug: "true-north-is-a-rumour",
    title: "True North Is a Rumour",
    date: "May 1, 2019",
    series: "Field Notes",
    body: [
      "Last entry in this series, I think. Maybe the last entry anywhere.",
      "There is a compass on the main stair at work. Seven notches, needle snapped at the pin. They tell visitors it broke in the move. It didn't. Someone broke it so it would always point where they wanted.",
      "If you have read these in order — really in order, the way the calendar runs — then you already know how to turn the dial. Count the days, not the posts. The needle has as many notches as you need.",
      "Whoever you are: they lie about small things first. Dates. Names. A photograph that used to have a face in it.",
    ].join("\n"),
  },
  {
    slug: "kitchen-butter-and-patience",
    title: "Ada's Kitchen: Butter & Patience",
    date: "April 14, 2019",
    series: "Ada's Kitchen",
    body: [
      "Shortbread for the night shift. Cream 4 tablespoons of cold butter with sugar until your wrist complains, then flour until it stops being sticky and starts being honest.",
      "Bake until the edges go the colour of old paper. Eat at your desk. Leave no crumbs on the ledgers.",
    ].join("\n"),
  },
  {
    slug: "footnotes-for-a-ghost",
    title: "Footnotes for a Ghost",
    date: "April 2, 2019",
    series: "Field Notes",
    body: [
      "There is a colleague of mine who no longer has a face. Not in the literal sense. In the staff photographs, the frame where she stood is empty, as if she stepped out of it a second before the shutter.",
      "She is still at her desk every morning. She still beats everyone at that ridiculous arcade game. But on paper, she is being thinned out, one footnote at a time.",
      "I have started keeping footnotes of my own.",
    ].join("\n"),
  },
  {
    slug: "ink-that-moves",
    title: "Ink That Moves",
    date: "March 1, 2019",
    series: "Field Notes",
    body: [
      "Ink is supposed to stay where you put it. That is the whole contract.",
      "This week a founding date changed in three places and nobody blinked. The plaque in the lobby, the charter scan, the 'About' page. The old number survives only where nobody thought to look — down at the bottom of the page, in the small print, where the dust settles.",
      "Somebody got the digits backwards when they rewrote it. Or somebody left them backwards on purpose.",
    ].join("\n"),
  },
  {
    slug: "kitchen-midnight-bread",
    title: "Ada's Kitchen: Midnight Bread",
    date: "February 23, 2019",
    series: "Ada's Kitchen",
    body: [
      "No-knead loaf for people who come home too late to knead. Whisk 2 eggs into warm milk, fold in 1 cup of strong flour and a pinch of salt, and leave it under a tea towel overnight.",
      "In the morning it will have risen without anyone watching it. Most things do.",
    ].join("\n"),
  },
  {
    slug: "redacted-weather",
    title: "Redacted Weather",
    date: "February 1, 2019",
    series: "Field Notes",
    body: [
      "Today I found a weather report with a black bar through it. A weather report. Rain, apparently, was classified on the night the harbour warehouse burned.",
      "You start to see the shape of a thing by what has been cut out of it. Like a stencil. Like a photo negative.",
      "I'm going to keep writing these. In order. Somebody should keep something in order.",
    ].join("\n"),
  },
  {
    slug: "kitchen-archivists-broth",
    title: "Ada's Kitchen: Archivist's Broth",
    date: "January 19, 2019",
    series: "Ada's Kitchen",
    body: [
      "My sister says I only ever eat soup out of a thermos at my desk, so here is the soup. Simmer 3 cups of water with an onion, a carrot and 1 bay leaf until the kitchen smells like somebody loves you.",
      "Salt to taste. Read something while it cooks. Not work. Never work.",
    ].join("\n"),
  },
  {
    slug: "dead-reckoning",
    title: "Dead Reckoning",
    date: "January 2, 2019",
    series: "Field Notes",
    body: [
      "Sailors without stars used dead reckoning: you know where you started, you know how far you've gone, and you trust the arithmetic over your eyes.",
      "I'm starting a notebook. Not the kind the Institute can audit. If anything happens to me, someone will need to know where I started.",
      "First bearing: the records are moving. Second bearing: I am not imagining it.",
    ].join("\n"),
  },
];

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Home", href: DRIFT_HOST },
    { text: "About", href: `${DRIFT_HOST}/about` },
  ],
};

const FOOTER: Block = { type: "footer", text: "The Drift — notes from someone who reads the footnotes. Comments are closed." };

function postBlock(p: DriftPost): Block {
  return { type: "post", title: p.title, author: "A.", date: p.date, body: p.body, series: p.series };
}

function home(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "The Drift" },
    { type: "paragraph", text: "Field notes, small hours, and the occasional recipe. Posts appear newest first — the way the world reads, and the wrong way to read a story." },
    ...DRIFT_POSTS.map(postBlock),
    FOOTER,
  ];
  return page(DRIFT_HOST, "The Drift", "drift", blocks, {
    headComments: ["static export — minimal-ink theme"],
    bodyComments: ["two series live here. only one of them is a map."],
    tailComments: ["draft image IMG_8841 removed from header after upload — too recognisable"],
  });
}

function about(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "About" },
    { type: "paragraph", text: "I work with old paper for a living. This is where I write the things I can't put in the official finding aids." },
    { type: "paragraph", text: "The Field Notes are a series. Read them from the first to the last. The first letter is where every bearing begins, and distance is measured in days." },
    { type: "paragraph", text: "The kitchen posts are just for my sister, who worries I don't eat." },
    FOOTER,
  ];
  return page(`${DRIFT_HOST}/about`, "About — The Drift", "drift", blocks);
}

function post(slug: string): SitePage | null {
  const p = DRIFT_POSTS.find((x) => x.slug === slug);
  if (!p) return null;
  const blocks: Block[] = [NAV, postBlock(p), { type: "link", text: "← All posts", href: DRIFT_HOST }, FOOTER];
  return page(`${DRIFT_HOST}/post/${p.slug}`, `${p.title} — The Drift`, "drift", blocks, {
    meta: { "article:published_time": p.date, "article:section": p.series },
  });
}

export function resolveDrift(path: string, _progress: RoomProgress): SitePage | null {
  if (path === "") return home();
  if (path === "/about") return about();
  const m = path.match(/^\/post\/([a-z0-9-]+)$/);
  if (m) return post(m[1]);
  return null;
}
