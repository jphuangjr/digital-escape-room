import { describe, expect, it } from "vitest";
import { adaPlaytestEvents, playtestReport, STALL_AFTER_MS, type PlaytestEvent } from "../playtest";

const G = "atlas-silent-worlds";
const t0 = new Date("2026-10-01T10:00:00Z").getTime();
const at = (min: number) => new Date(t0 + min * 60_000);
const ev = (roomRef: string, type: string, min: number, data: Record<string, unknown>): PlaytestEvent => ({
  roomRef,
  type,
  createdAt: at(min),
  data: { gameId: G, ...data },
});

describe("playtestReport", () => {
  const events: PlaytestEvent[] = [
    // room A: finishes
    ev("A", "milestone", 5, { flag: "clock.open", msFromRoomStart: 5 * 60_000 }),
    ev("A", "attempt", 20, { puzzleId: "atlas-engine", correct: false }),
    ev("A", "attempt", 21, { puzzleId: "atlas-engine", correct: true }),
    ev("A", "puzzle.solved", 21, { puzzleId: "atlas-engine", msFromRoomStart: 21 * 60_000 }),
    ev("A", "milestone", 21, { flag: "engine.on", msFromRoomStart: 21 * 60_000 }),
    ev("A", "hint", 15, { puzzleId: "engine", tier: 1 }),
    ev("A", "ending", 100, { ending: "reroute", hintsUsed: 1, msFromRoomStart: 100 * 60_000 }),
    // room B: stalls after the clock
    ev("B", "milestone", 9, { flag: "clock.open", msFromRoomStart: 9 * 60_000 }),
    ev("B", "hint", 30, { puzzleId: "engine", tier: 1 }),
    ev("B", "hint", 33, { puzzleId: "engine", tier: 2 }),
    // another game's room is ignored
    { roomRef: "C", type: "milestone", createdAt: at(1), data: { gameId: "nightingale-express", flag: "x" } },
  ];
  const r = playtestReport(G, events, new Date(t0 + 33 * 60_000 + STALL_AFTER_MS));

  it("counts rooms, finishes and abandoned spots", () => {
    expect(r.rooms).toMatchObject({ started: 2, finished: 1, inProgress: 0, medianMinutesToFinish: 100, medianHintsPerFinish: 1 });
    expect(r.stalls).toEqual([{ after: "clock.open", rooms: 1 }]);
  });

  it("orders the funnel by when rooms reach each step", () => {
    expect(r.milestones.map((m) => [m.flag, m.rooms, m.share])).toEqual([
      ["clock.open", 2, 1],
      ["engine.on", 1, 0.5],
    ]);
    expect(r.milestones[0].medianMinutes).toBe(7);
  });

  it("sums lock guesses and hints", () => {
    expect(r.locks).toEqual([
      { puzzleId: "atlas-engine", attempts: 2, wrongAttempts: 1, roomsAttempted: 1, roomsSolved: 1, attemptsPerSolve: 2, medianMinutesToSolve: 21 },
    ]);
    expect(r.hints).toEqual([{ puzzleId: "engine", requests: 3, rooms: 2, byTier: { 1: 2, 2: 1, 3: 0 } }]);
    expect(r.endings).toEqual({ reroute: 1 });
  });
});

describe("adaPlaytestEvents", () => {
  const A = "ada-voss";
  // Older Ada rows: no gameId, no times on solves or endings.
  const raw = (roomRef: string, type: string, min: number, data: Record<string, unknown> = {}): PlaytestEvent => ({ roomRef, type, createdAt: at(min), data });
  const events = [
    raw("R", "room.created", 0, { gameId: A }),
    raw("R", "site.visit", 2, { host: "meridian-inst.com" }),
    raw("R", "site.visit", 3, { host: "meridian-inst.com" }),
    raw("R", "attempt", 9, { puzzleId: "bonus-pin", correct: false }),
    raw("R", "attempt", 10, { puzzleId: "bonus-pin", correct: true }),
    raw("R", "puzzle.solved", 10, { puzzleId: "bonus-pin" }),
    raw("R", "hint", 30, { puzzleId: "final-phrase", tier: 1 }),
    raw("R", "ending", 70, { ending: "expose" }),
    raw("S", "room.created", 0, { gameId: A }),
    raw("S", "site.visit", 4, { host: "meridian-inst.com" }),
  ];
  const report = playtestReport(A, adaPlaytestEvents(A, events), at(24 * 60));

  it("turns first site visits and first solves into funnel steps, timed from the room's start", () => {
    expect(report.milestones).toEqual([
      { flag: "site:meridian-inst.com", rooms: 2, share: 1, medianMinutes: 3 },
      { flag: "puzzle:bonus-pin", rooms: 1, share: 0.5, medianMinutes: 10 },
    ]);
  });

  it("fills in ending time and hints, and counts the room's locks and stalls", () => {
    expect(report.rooms).toMatchObject({ started: 2, finished: 1, medianMinutesToFinish: 70, medianHintsPerFinish: 1 });
    expect(report.endings).toEqual({ expose: 1 });
    expect(report.locks[0]).toMatchObject({ puzzleId: "bonus-pin", attempts: 2, wrongAttempts: 1, roomsSolved: 1, medianMinutesToSolve: 10 });
    expect(report.hints).toEqual([{ puzzleId: "final-phrase", requests: 1, rooms: 1, byTier: { 1: 1, 2: 0, 3: 0 } }]);
    expect(report.stalls).toEqual([{ after: "site:meridian-inst.com", rooms: 1 }]);
  });
});
