import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Japanese endings, bonus epilogue, Ada's Personal files and the switch page: translated, file names unchanged.

const KANA = /[\u3040-\u30ff]/;
const paragraphs = (s: string) => s.split("\n\n").filter((p) => p.trim()).length;

describe("Japanese endings", () => {
  for (const ending of ["EXPOSE", "PROTECT"] as const) {
    it(`${ending} is Japanese with several paragraphs`, () => {
      const { title, body } = content.endingText(ending, "ja");
      expect(title).toMatch(KANA);
      expect(body).toMatch(KANA);
      expect(paragraphs(body)).toBeGreaterThanOrEqual(3);
      expect(body).not.toBe(content.endingText(ending, "en").body);
    });
  }

  it("PROTECT keeps the clue tokens", () => {
    const body = content.endingText("PROTECT", "ja").body;
    expect(body).toContain("マーラ");
    expect(body).toContain("compass_needle");
    expect(body).toContain("07:15");
    expect(body).toContain("1987");
    expect(body).toContain("1978");
  });

  it("bonus epilogue is Japanese with several paragraphs", () => {
    const epi = content.bonusEpilogue("ja");
    expect(epi).toMatch(KANA);
    expect(paragraphs(epi)).toBeGreaterThanOrEqual(3);
    expect(epi).toContain("1987");
  });
});

describe("Japanese bonus files", () => {
  const en = content.bonusFiles("en");
  const ja = content.bonusFiles("ja");

  it("keeps the same English file names in the same order", () => {
    expect(ja.map((f) => f.name)).toEqual(en.map((f) => f.name));
  });

  it("every body is Japanese", () => {
    for (const f of ja) expect(f.body, f.name).toMatch(KANA);
  });

  it("notes_on_mara.txt still names Mara as Dad's weather", () => {
    const note = ja.find((f) => f.name === "notes_on_mara.txt")!;
    expect(note.body).toContain("マーラ");
    expect(note.body).toContain("天気");
    expect(note.body).toContain("3月14日");
    expect(note.body).toContain("コンパス");
    expect(en.find((f) => f.name === "notes_on_mara.txt")!.body).toMatch(/Dad called her his weather/);
  });

  it("notes_on_wren.txt keeps Circuit Runner '94 in Latin", () => {
    expect(ja.find((f) => f.name === "notes_on_wren.txt")!.body).toContain("Circuit Runner '94");
  });
});

describe("Japanese switch", () => {
  const progress = (solved: RoomProgress["solved"]): RoomProgress => ({
    unlockedApps: ["browser", "notes", "email", "files", "decoder"],
    visitedSites: [],
    solved,
    badges: [],
    discoveries: [],
  });

  it("is hidden until the admin console is solved", () => {
    expect(content.resolveSite("switch.ada-voss.net", progress(["intranet-login"]), "ja")).toBeNull();
  });

  it("countdown page explains the proof-of-life phrase", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console"]), "ja")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(KANA);
    expect(json).toContain("Biscuit");
    expect(json).toContain("ハイフン");
    expect(p.blocks.some((b) => b.type === "form" && b.form === "final-phrase")).toBe(true);
  });

  it("solved page is Japanese", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console", "final-phrase"]), "ja")!;
    expect(JSON.stringify(p.blocks)).toMatch(KANA);
  });
});
