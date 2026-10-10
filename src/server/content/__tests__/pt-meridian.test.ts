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

const pt = (a: string, solved: RoomProgress["solved"] = []) => {
  const page = content.resolveSite(a, fresh(solved), "pt-BR");
  expect(page, a).not.toBeNull();
  return page!;
};
const en = (a: string, solved: RoomProgress["solved"] = []) => content.resolveSite(a, fresh(solved), "en")!;
const PORTUGUESE = /[ãõçáéíóúâêô]/i;
const text = (blocks: Block[]) => JSON.stringify(blocks);
const HARBOUR = ["harbourcc.edu", "harbourcc.edu/cs110", "harbourcc.edu/cs110/binary"];

describe("Portuguese Meridian and Harbour CC pages", () => {
  it("every page resolves in pt-BR and reads as Portuguese", () => {
    for (const a of [
      "meridian-inst.net",
      "meridian-inst.net/staff",
      "meridian-inst.net/about",
      "meridian-inst.net/vault-2019",
      "meridian-inst.net/collections",
      ...HARBOUR,
    ]) {
      const p = pt(a);
      expect(text(p.blocks), a).not.toBe(text(en(a).blocks));
      expect(text(p.blocks), a).toMatch(PORTUGUESE);
      expect(p.source, a).not.toBe(en(a).source);
      expect(p.source, a).toMatch(PORTUGUESE);
    }
  });

  it("Meridian keeps its puzzle tokens", () => {
    const home = pt("meridian-inst.net");
    expect(home.source).toContain("/vault-2019");
    for (const p of ["", "/staff", "/about", "/vault-2019", "/collections"]) {
      expect(pt(`meridian-inst.net${p}`).blocks.some((b) => b.type === "footer" && b.text.includes("© since 1978"))).toBe(true);
    }
    expect(text(pt("meridian-inst.net/about").blocks)).toContain("1987");
    expect(home.blocks.some((b) => b.type === "nav" && b.links.some((l) => l.href === "intranet.meridian-inst.net"))).toBe(true);
    expect(text(home.blocks)).toContain("Instituto Meridian");
  });

  it("pt-BR staff directory: 12 people, Wren unphotographed and pointing at RunnerBoard", () => {
    const staff = pt("meridian-inst.net/staff").blocks.find((b): b is Extract<Block, { type: "staff" }> => b.type === "staff")!;
    expect(staff.people).toHaveLength(12);
    const wren = staff.people.find((p) => p.name.includes("Wren Okafor"))!;
    expect(wren.name).toBe("Wren Okafor");
    expect(wren.role).toBe("Arquivista de sistemas");
    expect(wren.photo).toBeNull();
    expect(wren.bio).toContain("Circuit Runner '94");
    expect(wren.bio).toContain("runnerboard.net");
    expect(wren.bio).toMatch(PORTUGUESE);
    expect(wren.link?.href).toBe("runnerboard.net");
    expect(staff.people.filter((p) => p.photo === null)).toHaveLength(1);
    expect(staff.people.some((p) => p.name === "Dra. Ada Voss")).toBe(true);
  });

  it("vault photo's File Info still names the blog", () => {
    const img = pt("meridian-inst.net/vault-2019").blocks.find((b) => b.type === "image");
    const comment = img && img.type === "image" ? img.fileInfo.comment : "";
    expect(comment).toContain("thedrift.blog");
    expect(comment).toContain("rascunho");
  });

  it("binary lesson keeps the 26-row sheet and the quiz prompt", () => {
    const lesson = pt("harbourcc.edu/cs110/binary");
    const sheet = lesson.blocks.find((b) => b.type === "table");
    expect(sheet && sheet.type === "table" && sheet.rows.length).toBe(26);
    expect(sheet && sheet.type === "table" && sheet.rows[7]).toEqual(["H", "8", "01000"]);
    expect(sheet && sheet.type === "table" && sheet.columns.join(" ")).toMatch(PORTUGUESE);
    const quiz = lesson.blocks.find((b) => b.type === "form" && b.form === "binary-quiz");
    expect(quiz && quiz.type === "form" && quiz.prompt).toBe("01000 00101 01100 01100 01111");
    expect(text(lesson.blocks)).toContain("16, 8, 4, 2");
    for (const a of HARBOUR) {
      for (const solved of [[], ["binary-lesson"]] as RoomProgress["solved"][]) {
        const all = JSON.stringify(pt(a, solved)).toLowerCase();
        expect(all, a).not.toContain("lantern");
        expect(all, a).not.toContain("lanterna");
        expect(all, a).not.toContain("lampião");
        expect(all, a).not.toContain("farol");
      }
    }
    expect(text(pt("harbourcc.edu/cs110/binary", ["binary-lesson"]).blocks)).toMatch(/Decodificador/);
  });
});
