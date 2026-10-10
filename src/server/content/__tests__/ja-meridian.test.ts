import { describe, expect, it } from "vitest";
import type { Block, RoomProgress } from "@/lib/types";
import * as content from "../index";

const fresh = (solved: RoomProgress["solved"] = []): RoomProgress => ({
  unlockedApps: ["browser", "notes", "email", "files"],
  visitedSites: [],
  solved,
  badges: [],
  discoveries: [],
});

const ja = (a: string, solved: RoomProgress["solved"] = []) => {
  const page = content.resolveSite(a, fresh(solved), "ja");
  expect(page, a).not.toBeNull();
  return page!;
};
const KANA = /[぀-ヿ]/;
const LANTERN = /lantern|ランタン|灯籠|提灯/i;
const text = (blocks: Block[]) => JSON.stringify(blocks);

describe("Japanese Meridian and Harbour CC pages", () => {
  it("every page resolves in ja and contains kana", () => {
    for (const a of [
      "meridian-inst.net",
      "meridian-inst.net/staff",
      "meridian-inst.net/about",
      "meridian-inst.net/vault-2019",
      "meridian-inst.net/collections",
      "harbourcc.edu",
      "harbourcc.edu/cs110",
      "harbourcc.edu/cs110/binary",
    ]) {
      const p = ja(a);
      expect(text(p.blocks), a).toMatch(KANA);
      expect(p.source, a).toMatch(KANA);
    }
  });

  it("Meridian keeps its puzzle tokens", () => {
    const home = ja("meridian-inst.net");
    expect(home.source).toContain("/vault-2019");
    for (const p of ["", "/staff", "/about", "/vault-2019", "/collections"]) {
      expect(ja(`meridian-inst.net${p}`).blocks.some((b) => b.type === "footer" && b.text.includes("© since 1978"))).toBe(true);
    }
    expect(text(ja("meridian-inst.net/about").blocks)).toContain("1987");
    expect(home.blocks.some((b) => b.type === "nav" && b.links.some((l) => l.href === "intranet.meridian-inst.net"))).toBe(true);
    expect(text(home.blocks)).toContain("メリディアン研究所");
  });

  it("ja staff directory: 12 people, Wren unphotographed and pointing at RunnerBoard", () => {
    const staff = ja("meridian-inst.net/staff").blocks.find((b): b is Extract<Block, { type: "staff" }> => b.type === "staff")!;
    expect(staff.people).toHaveLength(12);
    const wren = staff.people.find((p) => p.name.includes("Wren Okafor"))!;
    expect(wren.name).toMatch(KANA);
    expect(wren.name).toContain("レン");
    expect(wren.photo).toBeNull();
    expect(wren.bio).toContain("Circuit Runner '94");
    expect(wren.bio).toContain("runnerboard.net");
    expect(wren.link?.href).toBe("runnerboard.net");
    expect(staff.people.filter((p) => p.photo === null)).toHaveLength(1);
  });

  it("vault photo's File Info still names the blog", () => {
    const img = ja("meridian-inst.net/vault-2019").blocks.find((b) => b.type === "image");
    expect(img && img.type === "image" && img.fileInfo.comment).toContain("thedrift.blog");
    expect(img && img.type === "image" && img.fileInfo.comment).toMatch(KANA);
  });

  it("binary lesson keeps the 26-row sheet and the quiz prompt", () => {
    const lesson = ja("harbourcc.edu/cs110/binary");
    const sheet = lesson.blocks.find((b) => b.type === "table");
    expect(sheet && sheet.type === "table" && sheet.rows.length).toBe(26);
    expect(sheet && sheet.type === "table" && sheet.rows[7]).toEqual(["H", "8", "01000"]);
    expect(sheet && sheet.type === "table" && sheet.columns.join(" ")).toMatch(/文字/);
    const quiz = lesson.blocks.find((b) => b.type === "form" && b.form === "binary-quiz");
    expect(quiz && quiz.type === "form" && quiz.prompt).toBe("01000 00101 01100 01100 01111");
    expect(text(lesson.blocks)).toContain("16, 8, 4, 2");
    for (const p of ["", "/cs110", "/cs110/binary"]) {
      expect(JSON.stringify(ja(`harbourcc.edu${p}`))).not.toMatch(LANTERN);
      expect(JSON.stringify(ja(`harbourcc.edu${p}`, ["binary-lesson"]))).not.toMatch(LANTERN);
    }
    expect(text(ja("harbourcc.edu/cs110/binary", ["binary-lesson"]).blocks)).toMatch(/デコーダー/);
  });
});
