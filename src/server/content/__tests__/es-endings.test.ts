import { describe, expect, it } from "vitest";
import type { RoomProgress } from "@/lib/types";
import * as content from "../index";

// Spanish endings, bonus epilogue, Ada's Personal files and the switch page: translated, file names unchanged.

const ES = /[áéíóúñ¿¡]/i;
const paragraphs = (s: string) => s.split("\n\n").filter((p) => p.trim()).length;

describe("Spanish endings", () => {
  for (const ending of ["EXPOSE", "PROTECT"] as const) {
    it(`${ending} is Spanish with several paragraphs`, () => {
      const { title, body } = content.endingText(ending, "es");
      const en = content.endingText(ending, "en");
      expect(title).not.toBe(en.title);
      expect(body).toMatch(ES);
      expect(paragraphs(body)).toBeGreaterThanOrEqual(3);
      expect(body).not.toBe(en.body);
    });
  }

  it("PROTECT keeps the clue tokens", () => {
    const body = content.endingText("PROTECT", "es").body;
    expect(body).toContain("Mara");
    expect(body).toContain("compass_needle");
    expect(body).toContain("07:15");
    expect(body).toContain("1987");
    expect(body).toContain("1978");
    expect(body).toContain("14 de marzo");
  });

  it("bonus epilogue is Spanish with several paragraphs", () => {
    const epi = content.bonusEpilogue("es");
    expect(epi).toMatch(ES);
    expect(epi).not.toBe(content.bonusEpilogue("en"));
    expect(paragraphs(epi)).toBeGreaterThanOrEqual(3);
    expect(epi).toContain("1987");
  });
});

describe("Spanish bonus files", () => {
  const en = content.bonusFiles("en");
  const es = content.bonusFiles("es");

  it("keeps the same English file names in the same order", () => {
    expect(es.map((f) => f.name)).toEqual(en.map((f) => f.name));
  });

  it("every body is Spanish", () => {
    es.forEach((f, i) => {
      expect(f.body, f.name).toMatch(ES);
      expect(f.body, f.name).not.toBe(en[i].body);
    });
  });

  it("notes_on_mara.txt still names Mara as Dad's weather", () => {
    const note = es.find((f) => f.name === "notes_on_mara.txt")!;
    expect(note.body).toContain("Mara");
    expect(note.body).toContain("clima");
    expect(note.body).toContain("14 de marzo");
    expect(note.body).toContain("brújula");
    expect(en.find((f) => f.name === "notes_on_mara.txt")!.body).toMatch(/Dad called her his weather/);
  });

  it("notes_on_wren.txt keeps Circuit Runner '94 in Latin", () => {
    expect(es.find((f) => f.name === "notes_on_wren.txt")!.body).toContain("Circuit Runner '94");
  });
});

describe("Spanish switch", () => {
  const progress = (solved: RoomProgress["solved"]): RoomProgress => ({
    unlockedApps: ["browser", "notes", "email", "files", "decoder"],
    visitedSites: [],
    solved,
    badges: [],
    discoveries: [],
  });

  it("is hidden until the admin console is solved", () => {
    expect(content.resolveSite("switch.ada-voss.net", progress(["intranet-login"]), "es")).toBeNull();
  });

  it("countdown page explains the proof-of-life phrase", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console"]), "es")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(ES);
    expect(json).toContain("Biscuit");
    expect(json).toContain("guiones");
    expect(p.blocks.some((b) => b.type === "form" && b.form === "final-phrase")).toBe(true);
  });

  it("solved page is Spanish", () => {
    const p = content.resolveSite("switch.ada-voss.net", progress(["intranet-login", "admin-console", "final-phrase"]), "es")!;
    const json = JSON.stringify(p.blocks);
    expect(json).toMatch(ES);
    expect(json).toContain("Me encontraste");
  });
});
