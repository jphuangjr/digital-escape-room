import { describe, expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import { decodeTimestamp, LOSTPAWS_CIPHERTEXT_CHUNKS, LOSTPAWS_PLAINTEXT } from "../cipher";
import * as content from "../index";
import { DRIFT_POSTS } from "../sites/drift";
import { FORUM_THREADS } from "../sites/runnerboard";

const fresh = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files", "decoder"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const es = (a: string, solved: RoomProgress["solved"] = []) => {
  const page = content.resolveSite(a, fresh(solved), "es");
  expect(page, a).not.toBeNull();
  return page!;
};
const en = (a: string, solved: RoomProgress["solved"] = []) => content.resolveSite(a, fresh(solved), "en")!;
const SPANISH = /[áéíóúñ¿¡]/i;
const text = (blocks: Block[]) => JSON.stringify(blocks);
type Post = Extract<Block, { type: "post" }>;
type Listing = Extract<Block, { type: "listing" }>;
const posts = (blocks: Block[]) => blocks.filter((b): b is Post => b.type === "post");
const listings = (blocks: Block[]) => blocks.filter((b): b is Listing => b.type === "listing");

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "2 de marzo de 2019" -> sortable number and day-of-month. */
function esDate(d: string): { key: number; day: number } {
  const m = d.match(/^(\d{1,2}) de ([a-z]+) de (\d{4})$/);
  expect(m, d).not.toBeNull();
  const mo = MONTHS.indexOf(m![2]) + 1;
  expect(mo, d).toBeGreaterThan(0);
  const day = Number(m![1]);
  return { key: Number(m![3]) * 10000 + mo * 100 + day, day };
}

describe("Spanish Drift, RunnerBoard and Lost Paws pages", () => {
  it("every page resolves in Spanish, differs from English and has Spanish characters", () => {
    const addrs = [
      "thedrift.blog",
      "thedrift.blog/about",
      ...DRIFT_POSTS.map((p) => `thedrift.blog/post/${p.slug}`),
      "runnerboard.net",
      "runnerboard.net/scores",
      "lostpaws.net",
    ];
    for (const a of addrs) {
      const p = es(a);
      expect(text(p.blocks), a).not.toBe(text(en(a).blocks));
      expect(text(p.blocks), a).toMatch(SPANISH);
      expect(p.source, a).toMatch(SPANISH);
    }
    expect(text(es("lostpaws.net", ["shift-key"]).blocks)).toMatch(SPANISH);
  });

  it("Drift: Field Notes titles on the Spanish page still start with the English title and spell DRIFT oldest-first, days 2,1,1,2,1 (sum 7)", () => {
    const shown = posts(es("thedrift.blog").blocks);
    const real = DRIFT_POSTS.filter((p) => p.series === "Field Notes").map((p) => {
      const b = shown.find((s) => s.title.startsWith(`${p.title} — `));
      expect(b, p.title).toBeDefined();
      expect(b!.title.length, p.title).toBeGreaterThan(p.title.length + 3);
      return { title: b!.title, ...esDate(b!.date) };
    });
    real.sort((a, b) => a.key - b.key);
    expect(real.map((r) => r.title[0]).join("")).toBe("DRIFT");
    const days = real.map((r) => r.day);
    expect(days).toEqual([2, 1, 1, 2, 1]);
    expect(days.reduce((a, b) => a + b, 0)).toBe(7);
    // display order (newest first) is not already DRIFT
    expect(shown.filter((s) => real.some((r) => r.title === s.title)).map((s) => s.title[0]).join("")).not.toBe("DRIFT");
    // every Spanish date keeps the English day-of-month
    for (const p of DRIFT_POSTS) expect(esDate(p.l10n.es.date).day, p.slug).toBe(Number(p.date.match(/ (\d+),/)![1]));
  });

  it("Drift: Spanish Ada's Kitchen measurements still sum to 11", () => {
    const shown = posts(es("thedrift.blog").blocks);
    const kitchenSeries = shown.find((s) => s.series?.includes("Ada's Kitchen"))?.series;
    const kitchen = shown.filter((s) => s.series === kitchenSeries);
    expect(kitchen).toHaveLength(DRIFT_POSTS.filter((p) => p.series === "Ada's Kitchen").length);
    for (const k of kitchen) expect(k.body).toMatch(SPANISH);
    const sum = kitchen.flatMap((k) => k.body.match(/\d+/g) ?? []).reduce((a, n) => a + Number(n), 0);
    expect(sum).toBe(11);
  });

  it("Drift: About page keeps the reading instructions in Spanish", () => {
    const t = text(es("thedrift.blog/about").blocks);
    expect(t).toContain("Field Notes");
    expect(t).toContain("primera letra");
  });

  it("RunnerBoard: timestamps decode to LOSTPAWS / TRAPDOOR on the Spanish page, Biscuit is mentioned", () => {
    const shown = posts(es("runnerboard.net").blocks);
    const spell = (u: string) => shown.filter((p) => p.author === u).map((p) => decodeTimestamp(p.time!)).join("");
    expect(spell("compass_needle")).toBe("LOSTPAWS");
    expect(spell("needle_compass")).toBe("TRAPDOOR");
    expect(shown.some((p) => p.author === "compass_needle" && p.body.includes("Biscuit") && SPANISH.test(p.body))).toBe(true);
    expect(text(es("runnerboard.net").blocks)).toContain("Circuit Runner '94");
    expect(text(es("runnerboard.net/scores").blocks)).toContain("W.OKAFOR — 2,418,770");
  });

  it("RunnerBoard: Spanish dates keep the day numbers; bodies add no usernames or HH:MM", () => {
    const MON: Record<string, string> = { Sep: "sept.", Oct: "oct." };
    for (const t of FORUM_THREADS)
      for (const p of t.posts) {
        const [mon, day] = p.date.split(" ");
        expect(p.l10n.es.date).toBe(`${day} de ${MON[mon]}`);
        expect(p.l10n.es.body).not.toMatch(/\d{1,2}:\d{2}/);
        for (const u of ["compass_needle", "needle_compass"])
          expect(p.l10n.es.body.includes(u), `${p.author} ${p.time} ${u}`).toBe(p.body.includes(u));
      }
  });

  it("Lost Paws: Spanish page keeps the ciphertext bodies, pet names and Biscuit's ID 0412", () => {
    const before = listings(es("lostpaws.net").blocks);
    expect(before.map((l) => l.body)).toEqual([...LOSTPAWS_CIPHERTEXT_CHUNKS]);
    const biscuit = before.find((l) => l.title.startsWith("Biscuit"));
    expect(biscuit?.petId).toBe("0412");
    expect(biscuit?.title).not.toBe(listings(en("lostpaws.net").blocks).find((l) => l.title.startsWith("Biscuit"))?.title);
    expect(es("lostpaws.net").blocks.some((b) => b.type === "form" && b.form === "shift-key" && SPANISH.test(b.prompt))).toBe(true);
    const after = listings(es("lostpaws.net", ["shift-key"]).blocks);
    expect(after.map((l) => l.body).join(" ")).toBe(LOSTPAWS_PLAINTEXT);
  });

  it("Lost Paws: decodeListings translates titles/meta but not bodies", () => {
    const out = listings(content.decodeListings(7, "es"));
    const eng = listings(content.decodeListings(7, "en"));
    expect(out.map((l) => l.body).join(" ")).toBe("WREN HAS THE KEY. VAULT CODE IS THE YEAR THEY LIED.");
    out.forEach((l, i) => {
      expect(l.title).not.toBe(eng[i].title);
      expect(l.meta).not.toBe(eng[i].meta);
      expect(l.title.split(" — ")[0]).toBe(eng[i].title.split(" — ")[0]);
    });
    expect(out.map((l) => l.petId)).toEqual(eng.map((l) => l.petId));
  });
});
