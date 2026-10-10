import { describe, expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import { decodeTimestamp, LOSTPAWS_CIPHERTEXT_CHUNKS, LOSTPAWS_PLAINTEXT } from "../cipher";
import * as content from "../index";
import { DRIFT_POSTS } from "../sites/drift";

const fresh = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const zh = (a: string, solved: RoomProgress["solved"] = []) => {
  const page = content.resolveSite(a, fresh(solved), "zh-TW");
  expect(page, a).not.toBeNull();
  return page!;
};
const CJK = /[一-鿿]/;
const text = (blocks: Block[]) => JSON.stringify(blocks);
type Post = Extract<Block, { type: "post" }>;
type Listing = Extract<Block, { type: "listing" }>;
const posts = (blocks: Block[]) => blocks.filter((b): b is Post => b.type === "post");
const listings = (blocks: Block[]) => blocks.filter((b): b is Listing => b.type === "listing");

/** "2019年3月2日" -> sortable number and day-of-month. */
function zhDate(d: string): { key: number; day: number } {
  const m = d.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  expect(m, d).not.toBeNull();
  const [, y, mo, day] = m!.map(Number);
  return { key: y * 10000 + mo * 100 + day, day };
}

describe("Chinese Drift, RunnerBoard and Lost Paws pages", () => {
  it("every page resolves in Chinese and contains Chinese characters", () => {
    const addrs = [
      "thedrift.blog",
      "thedrift.blog/about",
      ...DRIFT_POSTS.map((p) => `thedrift.blog/post/${p.slug}`),
      "runnerboard.net",
      "runnerboard.net/scores",
      "lostpaws.net",
    ];
    for (const a of addrs) {
      const p = zh(a);
      expect(text(p.blocks), a).toMatch(CJK);
      expect(p.source, a).toMatch(CJK);
    }
    expect(text(zh("lostpaws.net", ["shift-key"]).blocks)).toMatch(CJK);
  });

  it("Drift: Field Notes titles on the Chinese page still spell DRIFT oldest-first, days 2,1,1,2,1 (sum 7)", () => {
    const shown = posts(zh("thedrift.blog").blocks);
    const real = DRIFT_POSTS.filter((p) => p.series === "Field Notes").map((p) => {
      const b = shown.find((s) => s.title.startsWith(p.title));
      expect(b, p.title).toBeDefined();
      return { title: b!.title, ...zhDate(b!.date) };
    });
    real.sort((a, b) => a.key - b.key);
    expect(real.map((r) => r.title[0]).join("")).toBe("DRIFT");
    const days = real.map((r) => r.day);
    expect(days).toEqual([2, 1, 1, 2, 1]);
    expect(days.reduce((a, b) => a + b, 0)).toBe(7);
    // display order (newest first) is not already DRIFT
    expect(shown.filter((s) => real.some((r) => r.title === s.title)).map((s) => s.title[0]).join("")).not.toBe("DRIFT");
  });

  it("Drift: Chinese Ada's Kitchen measurements still sum to 11", () => {
    const shown = posts(zh("thedrift.blog").blocks);
    const kitchenSeries = shown.find((s) => s.series?.includes("Ada's Kitchen"))?.series;
    const kitchen = shown.filter((s) => s.series === kitchenSeries);
    expect(kitchen).toHaveLength(DRIFT_POSTS.filter((p) => p.series === "Ada's Kitchen").length);
    for (const k of kitchen) expect(k.body).toMatch(CJK);
    const sum = kitchen.flatMap((k) => k.body.match(/\d+/g) ?? []).reduce((a, n) => a + Number(n), 0);
    expect(sum).toBe(11);
  });

  it("Drift: About page keeps the reading instructions in Chinese", () => {
    const t = text(zh("thedrift.blog/about").blocks);
    expect(t).toContain("Field Notes");
    expect(t).toContain("第一個字母");
  });

  it("RunnerBoard: timestamps decode to LOSTPAWS / TRAPDOOR on the Chinese page, Biscuit is mentioned", () => {
    const shown = posts(zh("runnerboard.net").blocks);
    const spell = (u: string) => shown.filter((p) => p.author === u).map((p) => decodeTimestamp(p.time!)).join("");
    expect(spell("compass_needle")).toBe("LOSTPAWS");
    expect(spell("needle_compass")).toBe("TRAPDOOR");
    expect(shown.some((p) => p.author === "compass_needle" && p.body.includes("Biscuit") && CJK.test(p.body))).toBe(true);
    expect(text(zh("runnerboard.net").blocks)).toContain("Circuit Runner '94");
    expect(text(zh("runnerboard.net/scores").blocks)).toContain("W.OKAFOR — 2,418,770");
  });

  it("Lost Paws: Chinese page keeps the ciphertext bodies, pet names and Biscuit's ID 0412", () => {
    const before = listings(zh("lostpaws.net").blocks);
    expect(before.map((l) => l.body)).toEqual([...LOSTPAWS_CIPHERTEXT_CHUNKS]);
    const biscuit = before.find((l) => l.title.startsWith("Biscuit"));
    expect(biscuit?.petId).toBe("0412");
    expect(biscuit?.title).toMatch(CJK);
    expect(zh("lostpaws.net").blocks.some((b) => b.type === "form" && b.form === "shift-key" && CJK.test(b.prompt))).toBe(true);
    const after = listings(zh("lostpaws.net", ["shift-key"]).blocks);
    expect(after.map((l) => l.body).join(" ")).toBe(LOSTPAWS_PLAINTEXT);
  });

  it("Lost Paws: decodeListings translates titles/meta but not bodies", () => {
    const out = listings(content.decodeListings(7, "zh-TW"));
    expect(out.map((l) => l.body).join(" ")).toBe("WREN HAS THE KEY. VAULT CODE IS THE YEAR THEY LIED.");
    for (const l of out) {
      expect(l.title).toMatch(CJK);
      expect(l.meta).toMatch(CJK);
    }
    expect(out.map((l) => l.petId)).toEqual(listings(content.decodeListings(7, "en")).map((l) => l.petId));
  });
});
