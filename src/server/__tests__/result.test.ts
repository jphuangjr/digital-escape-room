import { describe, expect, it } from "vitest";
import { publicEndingMessage, runBadges } from "@/lib/result";
import { ACHIEVEMENTS } from "@/lib/achievements";

const base = { roomBadges: [], solved: true, playerCount: 2, hintsUsed: 1, wrongAttempts: 1, durationMs: 2 * 60 * 60 * 1000, rank: 40 };

describe("runBadges", () => {
  it("earns the run's achievements by the profile's rules", () => {
    expect(runBadges(base)).toEqual([]);
    expect(runBadges({ ...base, playerCount: 1, hintsUsed: 0, wrongAttempts: 0, durationMs: 1000, rank: 3 })).toEqual([
      "solo",
      "no-hints",
      "flawless",
      "under-hour",
      "top-ten",
    ]);
    expect(runBadges({ ...base, playerCount: 5 })).toEqual(["crew"]);
  });

  it("gives an unsolved run nothing but the team-size badge", () => {
    expect(runBadges({ ...base, solved: false, playerCount: 4, hintsUsed: 0, wrongAttempts: 0, durationMs: 1000, rank: 1 })).toEqual(["crew"]);
  });

  it("maps room badges to achievements that exist", () => {
    const out = runBadges({ ...base, roomBadges: ["compass", "envelope", "everyclue", "atlas-secrets", "atlas-reroute", "unknown"] });
    expect(out).toHaveLength(5);
    for (const id of out) expect(ACHIEVEMENTS.some((a) => a.id === id)).toBe(true);
  });
});

describe("publicEndingMessage", () => {
  it("never names the train's accused", () => {
    expect(publicEndingMessage("nightingale-express", "vance", true)).toEqual({ id: "result.ending.caught" });
    expect(publicEndingMessage("nightingale-express", "vance", false)).toEqual({ id: "result.ending.wrong" });
  });

  it("names the Atlas and Ada endings by their public labels", () => {
    expect(publicEndingMessage("atlas-silent-worlds", "sever", true)).toEqual({ id: "atlas.ending.sever" });
    expect(publicEndingMessage("ada-voss", "EXPOSE", true)).toEqual({ id: "room.ending.eyebrow", values: { ending: "EXPOSE" } });
    expect(publicEndingMessage("ada-voss", null, true)).toEqual({ id: "result.ending.escaped" });
  });
});
