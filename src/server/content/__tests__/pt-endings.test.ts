import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Portuguese endings, bonus epilogue, Ada's Personal files and the switch page: translated, file names unchanged.

const PT = /[ãõçáéíóúâêô]/i;
const paragraphs = (s: string) => s.split("\n\n").filter((p) => p.trim()).length;

describe("Portuguese endings", () => {
  for (const ending of ["EXPOSE", "PROTECT"] as const) {
    it(`${ending} is Portuguese with several paragraphs`, () => {
      const { title, body } = content.endingText(ending, "pt-BR");
      const en = content.endingText(ending, "en");
      expect(title).not.toBe(en.title);
      expect(body).toMatch(PT);
      expect(paragraphs(body)).toBeGreaterThanOrEqual(3);
      expect(body).not.toBe(en.body);
    });
  }

  it("PROTECT keeps the clue tokens", () => {
    const body = content.endingText("PROTECT", "pt-BR").body;
    expect(body).toContain("Mara");
    expect(body).toContain("compass_needle");
    expect(body).toContain("07:15");
    expect(body).toContain("1987");
    expect(body).toContain("1978");
    expect(body).toContain("14 de março");
  });

  it("bonus epilogue is Portuguese with several paragraphs", () => {
    const epi = content.bonusEpilogue("pt-BR");
    expect(epi).toMatch(PT);
    expect(epi).not.toBe(content.bonusEpilogue("en"));
    expect(paragraphs(epi)).toBeGreaterThanOrEqual(3);
    expect(epi).toContain("1987");
  });
});

describe("Portuguese bonus files", () => {
  const en = content.bonusFiles("en");
  const pt = content.bonusFiles("pt-BR");

  it("keeps the same English file names in the same order", () => {
    expect(pt.map((f) => f.name)).toEqual(en.map((f) => f.name));
  });

  it("every body is Portuguese", () => {
    pt.forEach((f, i) => {
      expect(f.body, f.name).toMatch(PT);
      expect(f.body, f.name).not.toBe(en[i].body);
    });
  });

  it("notes_on_mara.txt still names Mara as Dad's weather", () => {
    const note = pt.find((f) => f.name === "notes_on_mara.txt")!;
    expect(note.body).toContain("Mara");
    expect(note.body).toContain("clima");
    expect(note.body).toContain("14 de março");
    expect(note.body).toContain("bússola");
    expect(en.find((f) => f.name === "notes_on_mara.txt")!.body).toMatch(/Dad called her his weather/);
  });

  it("notes_on_wren.txt keeps Circuit Runner '94 in Latin", () => {
    expect(pt.find((f) => f.name === "notes_on_wren.txt")!.body).toContain("Circuit Runner '94");
  });
});

describe("Portuguese switch", () => {
  const progress = (solved: RoomProgress["solved"]): RoomProgress => ({
    unlockedApps: ["browser", "notes", "email", "files", "decoder"],
    visitedSites: [],
    solved,
    badges: [],
    discoveries: [],
  });

  it("is hidden until the admin console is solved", () => {
    expect(content.resolveSite("switch.ada-voss.net", progress(["intranet-login"]), "pt-BR")).toBeNull();
  });

  it("countdown page explains the proof-of-life phrase", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console"]), "pt-BR")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(PT);
    expect(json).toContain("Biscuit");
    expect(json).toContain("hífens");
    expect(p.blocks.some((b) => b.type === "form" && b.form === "final-phrase")).toBe(true);
  });

  it("solved page is Portuguese", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console", "final-phrase"]), "pt-BR")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(PT);
    expect(json).toContain("Você me encontrou");
  });
});
