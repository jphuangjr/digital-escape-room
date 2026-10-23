import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { aheadWhere, boardWhere, isAdminRun } from "../leaderboard";
import { runBadges } from "@/lib/result";

const admin = { user: { email: "owner@example.com" } };
const admin2 = { user: { email: "Second@Example.com" } };
const player = { user: { email: "player@example.com" } };
const guest = { user: null };

describe("isAdminRun", () => {
  let saved: string | undefined;
  beforeEach(() => {
    saved = process.env.ACCOUNT_ADMIN;
    process.env.ACCOUNT_ADMIN = "owner@example.com, second@example.com";
  });
  afterEach(() => {
    process.env.ACCOUNT_ADMIN = saved;
  });

  it("hides a run only admins played", () => {
    expect(isAdminRun([admin])).toBe(true);
    expect(isAdminRun([admin, admin2])).toBe(true);
  });

  it("shows a run with any guest or signed-in non-admin", () => {
    expect(isAdminRun([admin, guest])).toBe(false);
    expect(isAdminRun([admin, player])).toBe(false);
    expect(isAdminRun([player])).toBe(false);
    expect(isAdminRun([guest])).toBe(false);
    expect(isAdminRun([])).toBe(false);
  });

  it("hides nothing when no admins are configured", () => {
    process.env.ACCOUNT_ADMIN = "";
    expect(isAdminRun([admin])).toBe(false);
  });
});

describe("public board queries", () => {
  const own = { gameId: "ada-voss", solved: true, durationMs: 1000, wrongAttempts: 0, finishedAt: new Date(0) };

  it("lists and counts only entries that aren't hidden", () => {
    expect(boardWhere("ada-voss")).toEqual({ gameId: "ada-voss", hidden: false });
  });

  it("ranks against public entries only, solved or not", () => {
    expect(aheadWhere(own)).toMatchObject({ gameId: "ada-voss", hidden: false, solved: true });
    expect(aheadWhere({ ...own, solved: false })).toMatchObject({ gameId: "ada-voss", hidden: false });
  });

  it("gives a test run (no rank) no top-ten badge", () => {
    const run = { roomBadges: [], solved: true, playerCount: 2, hintsUsed: 1, wrongAttempts: 1, durationMs: 2 * 3_600_000 };
    expect(runBadges({ ...run, rank: 1 })).toContain("top-ten");
    expect(runBadges({ ...run, rank: null })).not.toContain("top-ten");
  });
});
