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

const ko = (a: string, solved: RoomProgress["solved"] = []) => {
  const page = content.resolveSite(a, fresh(solved), "ko");
  expect(page, a).not.toBeNull();
  return page!;
};
const HANGUL = /[가-힣]/;
const text = (blocks: Block[]) => JSON.stringify(blocks);

describe("Korean Meridian, Trapdoor and Harbour CC pages", () => {
  it("every page resolves in Korean and contains Hangul", () => {
    for (const a of [
      "meridian-inst.com",
      "meridian-inst.com/staff",
      "meridian-inst.com/about",
      "meridian-inst.com/vault-2019",
      "meridian-inst.com/collections",
      "trapdoor.com",
      "harbourcc.edu",
      "harbourcc.edu/cs110",
      "harbourcc.edu/cs110/binary",
    ]) {
      const p = ko(a);
      expect(text(p.blocks), a).toMatch(HANGUL);
      expect(p.source, a).toMatch(HANGUL);
    }
  });

  it("Meridian keeps its puzzle tokens", () => {
    const home = ko("meridian-inst.com");
    expect(home.source).toContain("/vault-2019");
    for (const p of ["", "/staff", "/about", "/vault-2019", "/collections"]) {
      expect(ko(`meridian-inst.com${p}`).blocks.some((b) => b.type === "footer" && b.text.includes("© since 1978"))).toBe(true);
    }
    expect(text(ko("meridian-inst.com/about").blocks)).toContain("1987");
    expect(home.blocks.some((b) => b.type === "nav" && b.links.some((l) => l.href === "intranet.meridian-inst.com"))).toBe(true);
  });

  it("Korean staff directory: 12 people, Wren unphotographed and naming RunnerBoard without a link", () => {
    const staff = ko("meridian-inst.com/staff").blocks.find((b): b is Extract<Block, { type: "staff" }> => b.type === "staff")!;
    expect(staff.people).toHaveLength(12);
    const wren = staff.people.find((p) => p.name.includes("Wren Okafor"))!;
    expect(wren.name).toMatch(HANGUL);
    expect(wren.photo).toBeNull();
    expect(wren.bio).toContain("Circuit Runner '94");
    expect(wren.bio).toContain("runnerboard.com");
    expect(wren.link).toBeUndefined();
    expect(staff.people.filter((p) => p.photo === null)).toHaveLength(1);
  });

  it("vault photo's File Info still names the blog", () => {
    const img = ko("meridian-inst.com/vault-2019").blocks.find((b) => b.type === "image");
    expect(img && img.type === "image" && img.fileInfo.comment).toContain("thedrift.blog");
    expect(img && img.type === "image" && img.fileInfo.comment).toMatch(HANGUL);
  });

  it("binary lesson keeps the 26-row sheet and the quiz prompt", () => {
    const lesson = ko("harbourcc.edu/cs110/binary");
    const sheet = lesson.blocks.find((b) => b.type === "table" && b.rows[0]?.[0] === "A");
    expect(sheet && sheet.type === "table" && sheet.rows.length).toBe(26);
    expect(sheet && sheet.type === "table" && sheet.rows[7]).toEqual(["H", "8", "01000"]);
    expect(sheet && sheet.type === "table" && sheet.columns.join(" ")).toMatch(HANGUL);
    const quiz = lesson.blocks.find((b) => b.type === "form" && b.form === "binary-quiz");
    expect(quiz && quiz.type === "form" && quiz.prompt).toBe("01000 00101 01100 01100 01111");
    expect(text(lesson.blocks)).toContain("16, 8, 4, 2");
    for (const p of ["", "/cs110", "/cs110/binary"]) {
      expect(JSON.stringify(ko(`harbourcc.edu${p}`)).toLowerCase()).not.toContain("lantern");
    }
    expect(text(ko("harbourcc.edu/cs110/binary", ["binary-lesson"]).blocks)).toMatch(/해독기/);
  });

  it("trapdoor still signs as the Office of Continuity", () => {
    expect(text(ko("trapdoor.com").blocks)).toContain("연속성 관리실");
  });
});
