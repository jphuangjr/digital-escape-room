import { describe, expect, it } from "vitest";
import { addHint, appendLog, jammedUntil, JAM_AFTER, JAM_SEC, MAX_LOG, nextHintTier, parseHints, parseJams, parseVote, recordGuess, stepVote, tally } from "../engine";
import { sceneGame } from "../games";

const t0 = new Date("2026-01-01T00:00:00Z");
const later = (sec: number) => new Date(t0.getTime() + sec * 1000);
const sam = { id: "p1", name: "Sam" };
const juno = { id: "p2", name: "Juno" };
const CHOICES = ["restore", "sever", "reroute"] as const;
type Choice = (typeof CHOICES)[number];

describe("case log", () => {
  it("stamps who and when, and keeps only the newest lines", () => {
    let log: { id: string; at: string; playerId: string; playerName: string; key: string }[] = [];
    for (let i = 0; i < MAX_LOG + 5; i++) log = appendLog(log, sam, t0, { key: `k${i}` });
    expect(log).toHaveLength(MAX_LOG);
    expect(log.at(-1)).toMatchObject({ playerId: "p1", playerName: "Sam", key: `k${MAX_LOG + 4}`, at: t0.toISOString() });
  });
});

describe("jamming locks", () => {
  it(`jams after ${JAM_AFTER} wrong guesses in a row for ${JAM_SEC}s, and a right guess resets the count`, () => {
    let jams = recordGuess({}, "door", false, t0).jams;
    jams = recordGuess(jams, "door", true, t0).jams;
    expect(jams.door).toEqual({ wrong: 0, until: null });
    let jammedNow = false;
    for (let i = 0; i < JAM_AFTER; i++) ({ jams, jammedNow } = recordGuess(jams, "door", false, t0));
    expect(jammedNow).toBe(true);
    expect(jammedUntil(jams, "door", later(JAM_SEC - 1))).toBeTruthy();
    expect(jammedUntil(jams, "door", later(JAM_SEC + 1))).toBeNull();
  });

  it("parses only known locks with sane fields", () => {
    expect(parseJams({ door: { wrong: 2, until: 5 }, nope: { wrong: 1 } }, ["door", "box"])).toEqual({ door: { wrong: 2, until: null } });
    expect(parseJams(null, ["door"])).toEqual({});
  });
});

describe("hints", () => {
  it("gives three tiers per puzzle, each after a cooldown", () => {
    expect(nextHintTier([], "gate", 60, t0)).toEqual({ tier: 1, readyAt: null });
    let hints = addHint([], "gate", 1, t0);
    expect(nextHintTier(hints, "gate", 60, later(10))).toEqual({ tier: 2, readyAt: later(60).toISOString() });
    expect(nextHintTier(hints, "valves", 60, later(10))).toEqual({ tier: 1, readyAt: null });
    hints = addHint(addHint(hints, "gate", 2, later(61)), "gate", 3, later(122));
    expect(nextHintTier(hints, "gate", 60, later(999))).toBeNull();
  });

  it("drops malformed stored hints", () => {
    expect(parseHints([{ id: "a", puzzle: "gate", tier: 1, at: "x" }, { puzzle: "gate", tier: 4, at: "x" }, null])).toHaveLength(1);
    expect(parseHints("nope")).toEqual([]);
  });
});

describe("room vote", () => {
  const two = { hostId: "p1", onlineIds: ["p1", "p2"] };
  const open = { votes: {}, tie: null };

  it("records votes until everyone online has voted, then a majority wins", () => {
    const a = stepVote<Choice>(open, { type: "vote", choice: "sever" }, sam, two, CHOICES);
    expect(a.kind).toBe("recorded");
    if (a.kind !== "recorded") return;
    const b = stepVote<Choice>(a.vote, { type: "vote", choice: "sever" }, juno, two, CHOICES);
    expect(b).toMatchObject({ kind: "winner", choice: "sever", counts: { restore: 0, sever: 2, reroute: 0 } });
  });

  it("hands a tie to the host, who must pick one of the tied choices", () => {
    const a = stepVote<Choice>(open, { type: "vote", choice: "sever" }, sam, two, CHOICES);
    if (a.kind !== "recorded") throw new Error("expected recorded");
    const b = stepVote<Choice>(a.vote, { type: "vote", choice: "restore" }, juno, two, CHOICES);
    expect(b).toMatchObject({ kind: "tie", vote: { tie: ["restore", "sever"] } });
    if (b.kind !== "tie") return;
    expect(stepVote<Choice>(b.vote, { type: "tiebreak", choice: "sever" }, juno, two, CHOICES)).toMatchObject({ reason: "hostOnlyTie" });
    expect(stepVote<Choice>(b.vote, { type: "tiebreak", choice: "reroute" }, sam, two, CHOICES)).toMatchObject({ reason: "pickTied" });
    expect(stepVote<Choice>(b.vote, { type: "tiebreak", choice: "sever" }, sam, two, CHOICES)).toMatchObject({ kind: "winner", choice: "sever" });
  });

  it("refuses moves that don't fit", () => {
    expect(stepVote<Choice>(null, { type: "vote", choice: "sever" }, sam, two, CHOICES)).toMatchObject({ reason: "noVote" });
    expect(stepVote<Choice>(open, { type: "vote", choice: "flee" }, sam, two, CHOICES)).toMatchObject({ reason: "badChoice" });
    expect(stepVote<Choice>(open, { type: "close" }, juno, two, CHOICES)).toMatchObject({ reason: "hostOnlyClose" });
    expect(stepVote<Choice>(open, { type: "close" }, sam, two, CHOICES)).toMatchObject({ reason: "noVotes" });
    expect(stepVote<Choice>(open, { type: "tiebreak", choice: "sever" }, sam, two, CHOICES)).toMatchObject({ reason: "noTie" });
  });

  it("tallies and parses only real choices", () => {
    const isChoice = (v: unknown): v is Choice => typeof v === "string" && (CHOICES as readonly string[]).includes(v);
    expect(parseVote({ votes: { p1: "sever", p2: "flee" }, tie: ["sever", 3] }, isChoice)).toEqual({ votes: { p1: "sever" }, tie: ["sever"] });
    expect(tally(CHOICES, { p1: "sever", p2: "sever" })).toEqual({ restore: 0, sever: 2, reroute: 0 });
  });
});

describe("game registry", () => {
  it("knows the Nightingale Express and nothing for Ada Voss", () => {
    const train = sceneGame("nightingale-express");
    expect(train).toBeDefined();
    expect(sceneGame("ada-voss")).toBeUndefined();
    expect(train!.isAction({ type: "unlock" })).toBe(true);
    expect(train!.isAction({ type: "dance" })).toBe(false);
    expect(train!.guessedLock({ type: "unlock", lock: "door", input: "1" })).toBe("door");
    expect(train!.lockPuzzleId("door")).toBe("nx-door");
    expect(train!.solvedEnding("varga")).toBe(true);
    expect(train!.solvedEnding("carrow")).toBe(false);
    expect(train!.ending(train!.parse(null))).toBeNull();
  });
});
