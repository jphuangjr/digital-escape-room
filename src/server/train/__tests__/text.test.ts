import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { LOCALES } from "@/i18n/config";
import { trainT } from "../text";

/** Every translation must keep the clues working: the same stops, digits, symbols and line counts. */
describe.each(LOCALES)("train text (%s)", (loc) => {
  const T = trainT(loc);
  const lines = (k: Parameters<typeof T>[0]) => T(k).split("\n");
  const stops = lines("tt.stops");

  it("keeps the line counts the puzzles rely on", () => {
    expect(lines("tt.head")).toHaveLength(4);
    expect(stops).toHaveLength(6);
    expect(lines("score.head")).toHaveLength(2);
    expect(lines("telegram.lines")).toHaveLength(5);
    expect(lines("tag.lines")).toHaveLength(2);
    expect(lines("score.suits").map((s) => s.trim()[0])).toEqual(["♠", "♥", "♦", "♣"]);
  });

  it("names Halden the way the timetable does in the suitcase hint", () => {
    // Halden Junction (02:47) is the fourth stop and the suitcase code.
    expect(T("hint.suitcase.3")).toContain(stops[3].trim());
    expect(T("hint.suitcase.3")).toContain("02:47");
  });

  it("keeps the door code and stops in the last door hint", () => {
    const h = T("hint.door.3").toLowerCase();
    expect(h.replace(/\D/g, "")).toContain("4796");
    for (const s of stops.slice(2, 5)) expect(h).toContain(s.trim().toLowerCase());
  });

  it("names Halden the timetable's way in the stop press, with platform 7", () => {
    expect(T("tt.stopPress")).toContain(stops[3].trim());
    expect(T("tt.stopPress")).toContain("7");
  });

  it("quotes the mirror's words in the mirror hint", () => {
    expect(T("hint.mirror.3")).toContain(T("mirror.letters"));
  });

  it("keeps the cash box symbols", () => {
    expect(T("hint.cashbox.3")).toContain("♦");
  });
});
