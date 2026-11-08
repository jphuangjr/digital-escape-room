import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, MIN_PLAYERS, isMoleRole, molesFor, type AllHandsAction, type Role } from "@/lib/allhands/types";
import { lineupFor, lineupIssues, lineupRoles, parseLineup, recommendedLineup, swapRole } from "@/lib/allhands/lineup";
import { applyAction, deal, initialState, parseState, viewFor, type AllHandsState } from "../allhands/game";
import type { PartyCtx } from "../party/registry";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const seq = () => {
  let i = 7;
  return (n: number) => (i = (i * 31 + 11) % 997) % n;
};
const ctx = (playerId: string, n: number, hostId = "p1"): PartyCtx => ({ playerId, hostId, roomPlayerIds: ids(n), now: 1000, rand: seq() });

function act(s: AllHandsState, who: string, a: AllHandsAction, n = 8) {
  const r = applyAction(s, a, ctx(who, n));
  if (!r.ok) throw new Error(`${who} ${a.type}: ${r.error}`);
  return r.state;
}

const tally = (roles: Role[]) => roles.reduce<Record<string, number>>((m, r) => ((m[r] = (m[r] ?? 0) + 1), m), {});

describe("recommended lineup", () => {
  it("matches the classic deal at every table size", () => {
    for (let n = MIN_PLAYERS; n <= 16; n++) {
      const l = lineupFor(n, DEFAULT_SETTINGS, null);
      const roles = lineupRoles(l)!;
      expect(roles).toHaveLength(n);
      expect(tally(roles)).toEqual(tally(deal(ids(n), seq(), DEFAULT_SETTINGS).map((x) => x.role)));
      expect(roles.filter(isMoleRole)).toHaveLength(molesFor(n));
      expect(lineupIssues(l)).toEqual([]);
      expect(l.custom).toBe(false);
    }
  });

  it("follows the house-rule switches", () => {
    const off = { ...DEFAULT_SETTINGS, recruiter: false, burnout: false };
    expect(recommendedLineup(10, off)).toEqual({ mole: 3, it: 1, hr: 1, intern: 1, nephew: 1 });
    expect(recommendedLineup(10, DEFAULT_SETTINGS)).toEqual({ mole: 2, recruiter: 1, it: 1, hr: 1, intern: 1, nephew: 1, burnout: 1 });
  });
});

describe("swapping roles", () => {
  it("swaps one seat, and lands back on recommended when undone", () => {
    const l = lineupFor(8, DEFAULT_SETTINGS, null);
    const r = swapRole(l, "employee", "mole");
    expect(r.ok && r.lineup?.mole).toBe(3);
    if (!r.ok || !r.lineup) throw new Error("swap failed");
    const l2 = lineupFor(8, DEFAULT_SETTINGS, r.lineup);
    expect(l2.custom).toBe(true);
    expect(l2.counts.employee).toBe(l.counts.employee - 1);
    const back = swapRole(l2, "mole", "employee");
    expect(back).toEqual({ ok: true, lineup: null });
  });

  it("allows one of each power and refuses swaps that don't exist", () => {
    const l = lineupFor(8, DEFAULT_SETTINGS, null);
    expect(swapRole(l, "employee", "it").ok).toBe(false);
    expect(swapRole(l, "recruiter", "mole").ok).toBe(false); // no Recruiter at 8
    expect(swapRole(l, "mole", "mole").ok).toBe(false);
    expect(swapRole(l, "employee", "wizard" as Role).ok).toBe(false);
  });
});

describe("balance warnings", () => {
  const issues = (n: number, custom: Parameters<typeof lineupFor>[2]) => lineupIssues(lineupFor(n, DEFAULT_SETTINGS, custom));

  it("blocks lineups that end the game before it starts", () => {
    expect(issues(6, { it: 1, hr: 1 }).some((x) => x.level === "block" && /no Moles/.test(x.text))).toBe(true);
    expect(issues(6, { mole: 3, it: 1 }).some((x) => x.level === "block" && /half the team/.test(x.text))).toBe(true);
    expect(issues(5, { mole: 1, it: 1, hr: 1, intern: 1, nephew: 1, burnout: 1 }).some((x) => x.level === "block" && /more role/.test(x.text))).toBe(
      true,
    );
  });

  it("warns which side has the edge", () => {
    expect(issues(10, { mole: 4, it: 1, hr: 1 }).map((x) => x.text).join(" ")).toMatch(/Moles have the edge/);
    expect(issues(10, { mole: 1, it: 1, hr: 1 }).map((x) => x.text).join(" ")).toMatch(/company has the edge/);
    expect(issues(8, { mole: 2, hr: 1 }).map((x) => x.text).join(" ")).toMatch(/No IT Guy/);
    expect(issues(6, { mole: 1, it: 1, hr: 1, nephew: 1 }).map((x) => x.text).join(" ")).toMatch(/meant for tables of 8/);
    expect(issues(8, { mole: 2, it: 1, hr: 1 }).every((x) => x.level === "warn")).toBe(true);
  });
});

describe("lineup in the lobby", () => {
  it("lets anyone in the room swap and reset, and deals exactly that lineup", () => {
    let s = act(initialState(), "p5", { type: "lineup", from: "employee", to: "mole" });
    s = act(s, "p3", { type: "lineup", from: "nephew", to: "employee" });
    expect(s.lineup).toEqual({ mole: 3, it: 1, hr: 1, intern: 1, burnout: 1 });
    expect(viewFor(s, "p4", { hostId: "p1" }).lineup).toEqual(s.lineup);

    const started = act(s, "p1", { type: "start" });
    expect(tally(started.seats.map((x) => x.role))).toEqual({ mole: 3, it: 1, hr: 1, intern: 1, burnout: 1, employee: 1 });
    expect(started.lineup).toEqual(s.lineup);

    // Kept between games, and only changeable between games.
    expect(applyAction(started, { type: "lineup", reset: true }, ctx("p2", 8)).ok).toBe(false);
    const back = act(started, "p1", { type: "end" });
    expect(back.lineup).toEqual(s.lineup);
    expect(act(back, "p2", { type: "lineup", reset: true }).lineup).toBeNull();
  });

  it("refuses to start a lineup that can't be played", () => {
    let s = initialState();
    s = act(s, "p2", { type: "lineup", from: "mole", to: "employee" }, 6);
    const r = applyAction(s, { type: "start" }, ctx("p1", 6));
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/no Moles/);
  });

  it("follows the headcount until someone customises it", () => {
    const s = initialState();
    expect(lineupFor(6, s.settings, s.lineup ?? null).counts.mole).toBe(1);
    expect(lineupFor(12, s.settings, s.lineup ?? null).counts.mole + lineupFor(12, s.settings, null).counts.recruiter).toBe(3);
  });

  it("parses stored lineups defensively", () => {
    expect(parseLineup({ mole: 2, it: 5, employee: 3, wizard: 1, hr: -1 })).toEqual({ mole: 2, it: 1 });
    expect(parseLineup("nope")).toBeNull();
    expect(parseState({ ...initialState(), lineup: { mole: "x" } }).lineup).toBeNull();
    expect(parseState({ v: 1, phase: "lobby" }).lineup).toBeNull();
  });
});
