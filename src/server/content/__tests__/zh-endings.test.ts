import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Traditional Chinese endings, bonus epilogue, Ada's Personal files and the switch page: translated, file names unchanged.

const CJK = /[一-鿿]/;
const paragraphs = (s: string) => s.split("\n\n").filter((p) => p.trim()).length;

describe("Chinese endings", () => {
  for (const ending of ["EXPOSE", "PROTECT"] as const) {
    it(`${ending} is Chinese with several paragraphs`, () => {
      const { title, body } = content.endingText(ending, "zh-TW");
      expect(title).toMatch(CJK);
      expect(body).toMatch(CJK);
      expect(paragraphs(body)).toBeGreaterThanOrEqual(3);
      expect(body).not.toBe(content.endingText(ending, "en").body);
    });
  }

  it("PROTECT keeps the clue tokens", () => {
    const body = content.endingText("PROTECT", "zh-TW").body;
    expect(body).toContain("瑪拉");
    expect(body).toContain("compass_needle");
    expect(body).toContain("07:15");
    expect(body).toContain("1987");
    expect(body).toContain("1978");
  });

  it("bonus epilogue is Chinese with several paragraphs", () => {
    const epi = content.bonusEpilogue("zh-TW");
    expect(epi).toMatch(CJK);
    expect(paragraphs(epi)).toBeGreaterThanOrEqual(3);
    expect(epi).toContain("1987");
  });
});

describe("Chinese bonus files", () => {
  const en = content.bonusFiles("en");
  const zh = content.bonusFiles("zh-TW");

  it("keeps the same English file names in the same order", () => {
    expect(zh.map((f) => f.name)).toEqual(en.map((f) => f.name));
  });

  it("every body is Chinese", () => {
    for (const f of zh) expect(f.body, f.name).toMatch(CJK);
  });

  it("notes_on_mara.txt still names Mara as Dad's weather", () => {
    const note = zh.find((f) => f.name === "notes_on_mara.txt")!;
    expect(note.body).toContain("瑪拉");
    expect(note.body).toContain("天氣");
    expect(note.body).toContain("3月14日");
    expect(note.body).toContain("指南針");
    expect(en.find((f) => f.name === "notes_on_mara.txt")!.body).toMatch(/Dad called her his weather/);
  });

  it("notes_on_wren.txt keeps Circuit Runner '94 in Latin", () => {
    expect(zh.find((f) => f.name === "notes_on_wren.txt")!.body).toContain("Circuit Runner '94");
  });
});

describe("Chinese switch", () => {
  const progress = (solved: RoomProgress["solved"]): RoomProgress => ({
    unlockedApps: ["browser", "notes", "email", "files", "decoder"],
    visitedSites: [],
    solved,
    badges: [],
    discoveries: [],
  });

  it("is hidden until the admin console is solved", () => {
    expect(content.resolveSite("switch.ada-voss.net", progress(["intranet-login"]), "zh-TW")).toBeNull();
  });

  it("countdown page explains the proof-of-life phrase", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console"]), "zh-TW")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(CJK);
    expect(json).toContain("Biscuit");
    expect(json).toContain("連字號");
    expect(p.blocks.some((b) => b.type === "form" && b.form === "final-phrase")).toBe(true);
  });

  it("solved page is Chinese", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console", "final-phrase"]), "zh-TW")!;
    expect(JSON.stringify(p.blocks)).toMatch(CJK);
  });
});
