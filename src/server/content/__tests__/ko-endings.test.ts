import { describe, expect, it } from "vitest";
import * as content from "../index";

// Korean endings, bonus epilogue and Ada's Personal files: translated, file names unchanged.

const HANGUL = /[가-힣]/;
const paragraphs = (s: string) => s.split("\n\n").filter((p) => p.trim()).length;

describe("Korean endings", () => {
  for (const ending of ["EXPOSE", "PROTECT"] as const) {
    it(`${ending} is Korean with several paragraphs`, () => {
      const { title, body } = content.endingText(ending, "ko");
      expect(title).toMatch(HANGUL);
      expect(body).toMatch(HANGUL);
      expect(paragraphs(body)).toBeGreaterThanOrEqual(3);
      expect(body).not.toBe(content.endingText(ending, "en").body);
    });
  }

  it("PROTECT keeps the clue tokens", () => {
    const body = content.endingText("PROTECT", "ko").body;
    expect(body).toContain("마라");
    expect(body).toContain("compass_needle");
    expect(body).toContain("07:15");
    expect(body).toContain("1987");
    expect(body).toContain("1978");
  });

  it("bonus epilogue is Korean with several paragraphs", () => {
    const epi = content.bonusEpilogue("ko");
    expect(epi).toMatch(HANGUL);
    expect(paragraphs(epi)).toBeGreaterThanOrEqual(3);
    expect(epi).toContain("1987");
  });
});

describe("Korean bonus files", () => {
  const en = content.bonusFiles("en");
  const ko = content.bonusFiles("ko");

  it("keeps the same English file names in the same order", () => {
    expect(ko.map((f) => f.name)).toEqual(en.map((f) => f.name));
  });

  it("every body is Korean", () => {
    for (const f of ko) expect(f.body, f.name).toMatch(HANGUL);
  });

  it("notes_on_mara.txt still names Mara as Dad's weather", () => {
    const note = ko.find((f) => f.name === "notes_on_mara.txt")!;
    expect(note.body).toContain("마라");
    expect(note.body).toContain("날씨");
    expect(note.body).toContain("3월 14일");
    expect(note.body).toContain("나침반");
    expect(en.find((f) => f.name === "notes_on_mara.txt")!.body).toMatch(/Dad called her his weather/);
  });

  it("notes_on_wren.txt keeps Circuit Runner '94 in Latin", () => {
    expect(ko.find((f) => f.name === "notes_on_wren.txt")!.body).toContain("Circuit Runner '94");
  });
});
