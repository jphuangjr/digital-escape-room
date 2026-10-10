import { expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import { PUZZLE_IDS } from "@/server/logic";
import * as content from "../index";
import { SITE_HOSTS } from "../sites";

// Freezes every piece of English story output. Translating the story must not change a byte of English;
// if an English change is intended, update the snapshot with `npx vitest run -u` and review the diff.

const progress = (solved: RoomProgress["solved"]): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

function hrefs(blocks: Block[]): string[] {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.type === "link") out.push(b.href);
    if (b.type === "nav") out.push(...b.links.map((l) => l.href));
    if (b.type === "staff") for (const p of b.people) if (p.link) out.push(p.link.href);
  }
  return out;
}

function crawl(p: RoomProgress) {
  const seen = new Map<string, unknown>();
  const queue = [...SITE_HOSTS, "meridian-inst.net/vault-2019", "intranet.meridian-inst.net/admin"];
  while (queue.length) {
    const a = content.normalizeAddress(queue.shift()!);
    if (seen.has(a)) continue;
    const page = content.resolveSite(a, p, "en");
    seen.set(a, page);
    if (page) queue.push(...hrefs(page.blocks).map((h) => (h.startsWith("/") ? a.split("/")[0] + h : h)));
  }
  return Object.fromEntries([...seen.entries()].sort(([x], [y]) => x.localeCompare(y)));
}

it("English story output is unchanged", async () => {
  const hints = content.HINT_PUZZLES.flatMap((id) =>
    ([1, 2, 3] as const).map((tier) => ({ puzzleId: id, tier, text: content.getHint(id, tier, "en"), unlockedAt: "2026-01-01T00:00:00Z" })),
  );
  const all = {
    sitesFresh: crawl(progress([])),
    sitesSolved: crawl(progress([...PUZZLE_IDS])),
    decodePreview: [0, 7, 11].map((s) => content.decodeListings(s, "en")),
    emails: content.baseEmails("en"),
    voicemails: content.voicemailsFor(progress([...PUZZLE_IDS]), hints, "en"),
    endings: { EXPOSE: content.endingText("EXPOSE", "en"), PROTECT: content.endingText("PROTECT", "en") },
    epilogue: content.bonusEpilogue("en"),
    files: content.bonusFiles("en"),
  };
  await expect(JSON.stringify(all, null, 1)).toMatchFileSnapshot("./__snapshots__/english-story.json");
});
