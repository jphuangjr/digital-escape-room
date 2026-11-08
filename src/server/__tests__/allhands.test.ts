import { describe, expect, it } from "vitest";
import { MIN_PLAYERS, SKIP, molesFor, type AllHandsAction, type Role } from "@/lib/allhands/types";
import {
  DAWN_MS,
  EXIT_MS,
  REVEAL_MS,
  applyAction,
  advanceState,
  botMove,
  canTeamChat,
  teamOf,
  deal,
  initialState,
  moleChoice,
  parseAction,
  parseState,
  reviewResult,
  viewFor,
  winnerOf,
  type AllHandsState,
  type Seat,
} from "../allhands/game";
import type { PartyCtx } from "../party/registry";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
/** A fixed "random" source so deals are reproducible. */
const seq = () => {
  let i = 7;
  return (n: number) => (i = (i * 31 + 11) % 997) % n;
};

function ctx(playerId: string, now: number, roomPlayerIds = ids(6), hostId = "p1"): PartyCtx {
  return { playerId, hostId, roomPlayerIds, now, rand: seq() };
}

function act(s: AllHandsState, who: string, a: AllHandsAction, now = 1000, room = ids(6)) {
  const r = applyAction(s, a, ctx(who, now, room));
  if (!r.ok) throw new Error(`${who} ${a.type}: ${r.error}`);
  return r.state;
}

/** A started game with a known table: p1 mole, p2 IT, p3 HR, the rest employees. */
function table(n = 6, roles?: Role[]): AllHandsState {
  const r = roles ?? (["mole", "it", "hr", ...Array(n - 3).fill("employee")] as Role[]);
  const seats: Seat[] = ids(n).map((id, i) => ({ id, role: r[i], title: `T${i}`, alive: true, ready: false }));
  return { ...initialState(), phase: "reveal", seats, endsAt: 1000 + REVEAL_MS };
}

function toNight(s: AllHandsState): AllHandsState {
  for (const x of s.seats) s = act(s, x.id, { type: "ready" }, 1000, s.seats.map((y) => y.id));
  expect(s.phase).toBe("night");
  return s;
}

describe("dealing", () => {
  it("gives the right mix for every table size", () => {
    for (let n = MIN_PLAYERS; n <= 16; n++) {
      const seats = deal(ids(n), seq());
      const count = (r: Role) => seats.filter((x) => x.role === r).length;
      expect(count("mole")).toBe(molesFor(n));
      expect(count("it")).toBe(1);
      expect(count("hr")).toBe(1);
      expect(count("employee")).toBe(n - molesFor(n) - 2);
      expect(new Set(seats.map((x) => x.title)).size).toBe(n);
    }
  });

  it("needs at least 5 players and only the host can start", () => {
    const s = initialState();
    expect(applyAction(s, { type: "start" }, ctx("p1", 0, ids(4))).ok).toBe(false);
    expect(applyAction(s, { type: "start" }, ctx("p2", 0, ids(6))).ok).toBe(false);
    const r = applyAction(s, { type: "start" }, ctx("p1", 0, ids(6)));
    expect(r.ok).toBe(true);
    expect(r.state.phase).toBe("reveal");
    expect(r.state.seats).toHaveLength(6);
  });
});

describe("secrecy", () => {
  it("never shows a living player another player's role, except Moles seeing Moles", () => {
    const s = toNight(table(8, ["mole", "mole", "it", "hr", "employee", "employee", "employee", "employee"]));
    for (const seat of s.seats) {
      const v = viewFor(s, seat.id, { hostId: "p1" });
      for (const other of v.seats) {
        if (other.id === seat.id) expect(other.role).toBe(seat.role);
        else if (seat.role === "mole" && s.seats.find((x) => x.id === other.id)!.role === "mole") expect(other.role).toBe("mole");
        else expect(other.role).toBeNull();
      }
      expect(v.nights).toBeNull();
      if (seat.role !== "mole") expect(v.night!.team).toBeNull();
      // Nothing in the serialized view names a role it shouldn't.
      const json = JSON.stringify(v);
      if (seat.role === "employee") expect(json).not.toContain('"mole"');
    }
  });

  it("spectators who joined late see no roles", () => {
    const s = toNight(table());
    const v = viewFor(s, "late", { hostId: "p1" });
    expect(v.me.seated).toBe(false);
    expect(v.seats.every((x) => x.role === null)).toBe(true);
    expect(v.night).toBeNull();
  });

  it("everyone gets an after-hours screen, so no one can tell who has a power", () => {
    const s = toNight(table());
    const kinds = s.seats.map((x) => viewFor(s, x.id, { hostId: "p1" }).night?.kind);
    expect(kinds).toEqual(["mole", "it", "hr", "decoy", "decoy", "decoy"]);
  });
});

describe("after hours", () => {
  it("lays off the Moles' target and ends early once everyone has picked", () => {
    let s = toNight(table());
    s = act(s, "p1", { type: "pick", target: "p4" });
    s = act(s, "p2", { type: "pick", target: "p1" });
    s = act(s, "p3", { type: "pick", target: "p5" });
    s = act(s, "p4", { type: "pick", target: "p2" });
    s = act(s, "p5", { type: "pick", target: "p2" });
    expect(s.phase).toBe("night");
    s = act(s, "p6", { type: "pick", target: "p2" });
    expect(s.phase).toBe("dawn");
    expect(s.dawn).toEqual({ round: 1, laidOff: "p4", saved: false });
    expect(s.seats.find((x) => x.id === "p4")!.alive).toBe(false);
    expect(s.checks).toEqual([{ round: 1, target: "p1", isMole: true }]);
    // Only the IT Guy sees the result.
    expect(viewFor(s, "p2", { hostId: "p1" }).checks).toHaveLength(1);
    expect(viewFor(s, "p5", { hostId: "p1" }).checks).toHaveLength(0);
  });

  it("HR blocks a layoff and can't protect the same person twice in a row", () => {
    let s = toNight(table());
    s = act(s, "p1", { type: "pick", target: "p4" });
    s = act(s, "p3", { type: "pick", target: "p4" });
    s = advanceState(s, 1000 + 60_000).state;
    expect(s.dawn).toEqual({ round: 1, laidOff: null, saved: true });
    expect(s.seats.every((x) => x.alive)).toBe(true);
    s = advanceState(s, 1000 + 60_000 + DAWN_MS).state; // day
    s = act(s, "p1", { type: "skip" }); // vote
    s = act(s, "p1", { type: "skip" }); // exit (nobody fired)
    s = act(s, "p1", { type: "skip" }); // night 2
    expect(s.phase).toBe("night");
    expect(applyAction(s, { type: "pick", target: "p4" }, ctx("p3", 1000)).ok).toBe(false);
  });

  it("refuses picks that break the rules", () => {
    const s = toNight(table());
    expect(applyAction(s, { type: "pick", target: "p1" }, ctx("p1", 1000)).ok).toBe(false); // a Mole picking a Mole
    expect(applyAction(s, { type: "pick", target: "p4" }, ctx("p4", 1000)).ok).toBe(false); // yourself
    expect(applyAction(s, { type: "pick", target: "nobody" }, ctx("p4", 1000)).ok).toBe(false);
  });

  it("Moles who disagree go with the most-picked target, then the first Mole's pick", () => {
    const s = table(8, ["mole", "mole", "mole", "it", "hr", "employee", "employee", "employee"]);
    expect(moleChoice({ ...s, picks: { p1: "p6", p2: "p7", p3: "p7" } })).toBe("p7");
    expect(moleChoice({ ...s, picks: { p2: "p7", p3: "p6" } })).toBe("p7");
    expect(moleChoice({ ...s, picks: {} })).toBeNull();
  });
});

describe("performance review", () => {
  it("fires the most-voted player only if they beat circle-back and nobody ties", () => {
    const s = table();
    expect(reviewResult({ ...s, votes: { p1: "p4", p2: "p4", p3: SKIP } })).toEqual({ fired: "p4", votes: 2 });
    expect(reviewResult({ ...s, votes: { p1: "p4", p2: SKIP } }).fired).toBeNull();
    expect(reviewResult({ ...s, votes: { p1: "p4", p2: "p5" } }).fired).toBeNull();
    expect(reviewResult({ ...s, votes: {} }).fired).toBeNull();
  });

  it("closes as soon as every current employee has voted, then holds the exit interview", () => {
    let s = toNight(table());
    s = act(s, "p1", { type: "skip" }); // dawn, nobody picked
    expect(s.dawn?.laidOff).toBeNull();
    s = act(s, "p1", { type: "skip" }); // day
    s = act(s, "p1", { type: "skip" }); // vote
    for (const id of ["p2", "p3", "p4", "p5", "p6"]) s = act(s, id, { type: "vote", target: "p1" });
    expect(s.phase).toBe("vote");
    s = act(s, "p1", { type: "vote", target: "p2" });
    expect(s.phase).toBe("exit");
    expect(s.exit).toEqual({ fired: "p1", votes: 5, survived: false });
    // The only Mole is gone: the company wins after the exit interview.
    s = advanceState(s, 1000 + EXIT_MS).state;
    expect(s.phase).toBe("over");
    expect(s.winner).toBe("company");
    // At game over everyone sees every role and every night.
    const v = viewFor(s, "p4", { hostId: "p1" });
    expect(v.seats.map((x) => x.role)).toEqual(["mole", "it", "hr", "employee", "employee", "employee"]);
    expect(v.nights).toHaveLength(1);
  });

  it("hides a fired player's role when the host turned reveals off", () => {
    let s = toNight({ ...table(), settings: { ...initialState().settings, revealOnFire: false } });
    s = act(s, "p1", { type: "skip" });
    s = act(s, "p1", { type: "skip" });
    s = act(s, "p1", { type: "skip" });
    for (const id of ["p1", "p2", "p3", "p5", "p6"]) s = act(s, id, { type: "vote", target: "p4" });
    s = act(s, "p4", { type: "vote", target: "p5" });
    expect(s.exit?.fired).toBe("p4");
    expect(viewFor(s, "p5", { hostId: "p1" }).exit!.role).toBeNull();
    // The fired player is now a ghost and sees everything.
    const ghost = viewFor(s, "p4", { hostId: "p1" });
    expect(ghost.seats.every((x) => x.role !== null)).toBe(true);
    expect(ghost.nights).not.toBeNull();
  });

  it("refuses votes from the departed and for yourself", () => {
    let s = toNight(table());
    s = act(s, "p1", { type: "skip" });
    s = act(s, "p1", { type: "skip" });
    s = act(s, "p1", { type: "skip" });
    expect(applyAction(s, { type: "vote", target: "p4" }, ctx("p4", 1000)).ok).toBe(false);
    const dead = { ...s, seats: s.seats.map((x) => (x.id === "p5" ? { ...x, alive: false } : x)) };
    expect(applyAction(dead, { type: "vote", target: "p4" }, ctx("p5", 1000)).ok).toBe(false);
  });
});

describe("winning", () => {
  it("Moles win once they equal everyone else", () => {
    const s = table(5, ["mole", "mole", "it", "hr", "employee"]);
    expect(winnerOf(s)).toBeNull();
    const dead = (...who: string[]) => ({ ...s, seats: s.seats.map((x) => (who.includes(x.id) ? { ...x, alive: false } : x)) });
    expect(winnerOf(dead("p5"))).toBe("moles");
    expect(winnerOf(dead("p1", "p2"))).toBe("company");
  });

  it("a final layoff shows the morning news before the game ends", () => {
    let s = toNight(table(5, ["mole", "it", "hr", "employee", "employee"]));
    s = { ...s, seats: s.seats.map((x) => (x.id === "p4" || x.id === "p5" ? { ...x, alive: false } : x)) };
    s = act(s, "p1", { type: "pick", target: "p3" }, 1000, ids(5));
    s = act(s, "p1", { type: "skip" }, 1000, ids(5));
    expect(s.phase).toBe("dawn");
    expect(viewFor(s, "p2", { hostId: "p1" }).winner).toBeNull();
    s = advanceState(s, 1000 + DAWN_MS).state;
    expect(s.phase).toBe("over");
    expect(s.winner).toBe("moles");
  });
});

describe("clock and host controls", () => {
  it("advances one phase per expired timer, with a fresh clock", () => {
    let s = table();
    expect(advanceState(s, 1000).changed).toBe(false);
    s = advanceState(s, 1000 + REVEAL_MS + 999_999).state;
    expect(s.phase).toBe("night");
    expect(s.endsAt).toBe(1000 + REVEAL_MS + 999_999 + s.settings.nightMs);
  });

  it("pauses and resumes the clock", () => {
    let s = table();
    s = act(s, "p1", { type: "pause" }, 11_000);
    expect(s.endsAt).toBeNull();
    expect(s.pausedLeft).toBe(REVEAL_MS - 10_000);
    expect(advanceState(s, 10_000_000).changed).toBe(false);
    s = act(s, "p1", { type: "resume" }, 50_000);
    expect(s.endsAt).toBe(50_000 + REVEAL_MS - 10_000);
  });

  it("keeps host controls for the host", () => {
    const s = table();
    for (const type of ["skip", "pause", "end"] as const) expect(applyAction(s, { type }, ctx("p2", 1000)).ok).toBe(false);
    expect(applyAction(initialState(), { type: "kick", playerId: "p3" }, ctx("p2", 1000)).ok).toBe(false);
    expect(applyAction(initialState(), { type: "kick", playerId: "p3" }, ctx("p1", 1000)).ok).toBe(true);
    expect(applyAction(s, { type: "kick", playerId: "p3" }, ctx("p1", 1000)).ok).toBe(false);
  });

  it("ignores a stale skip from a host whose screen is a phase behind", () => {
    const s = table();
    const r = applyAction(s, { type: "skip", from: "night" }, ctx("p1", 1000));
    expect(r.ok).toBe(true);
    expect(r.state.phase).toBe("reveal");
    expect(applyAction(s, { type: "skip", from: "reveal" }, ctx("p1", 1000)).state.phase).toBe("night");
  });

  it("only takes known day lengths", () => {
    const s = act(initialState(), "p1", { type: "settings", settings: { dayMs: 1, revealOnFire: false } });
    expect(s.settings.dayMs).toBe(initialState().settings.dayMs);
    expect(s.settings.revealOnFire).toBe(false);
  });
});

describe("parsing", () => {
  it("tolerates junk", () => {
    expect(parseState(null).phase).toBe("lobby");
    expect(parseState({ v: 2 }).phase).toBe("lobby");
    expect(parseAction({ type: "pick" })).toBeNull();
    expect(parseAction({ type: "nope" })).toBeNull();
    expect(parseAction({ type: "vote", target: "skip" })).toEqual({ type: "vote", target: "skip" });
  });
});

describe("chat", () => {
  const roles: Role[] = ["mole", "mole", "it", "hr", "employee", "employee", "employee"];
  const room = ids(7);

  it("keeps the Mole channel to Moles, and out of everyone else's view", () => {
    let s = table(7, roles);
    s = act(s, "p1", { type: "moleChat", body: "  go for p3  " }, 2000, room);
    s = act(s, "p2", { type: "moleChat", body: "ok" }, 2100, room);
    expect(viewFor(s, "p1", { hostId: "p1" }).moleChat?.map((m) => [m.from, m.body])).toEqual([
      ["p1", "go for p3"],
      ["p2", "ok"],
    ]);
    expect(viewFor(s, "p2", { hostId: "p1" }).canMoleChat).toBe(true);
    for (const id of ["p3", "p4", "p5"]) {
      const v = viewFor(s, id, { hostId: "p1" });
      expect(v.moleChat).toBeNull();
      expect(v.canMoleChat).toBe(false);
      expect(JSON.stringify(v)).not.toContain("go for p3");
    }
    expect(viewFor(s, "late-joiner", { hostId: "p1" }).moleChat).toBeNull();
  });

  it("refuses posts from non-Moles, the laid-off, and outside a game", () => {
    const s = table(7, roles);
    expect(applyAction(s, { type: "moleChat", body: "hi" }, ctx("p3", 2000, room)).ok).toBe(false);
    const dead = { ...s, seats: s.seats.map((x) => (x.id === "p2" ? { ...x, alive: false } : x)) };
    expect(applyAction(dead, { type: "moleChat", body: "hi" }, ctx("p2", 2000, room)).ok).toBe(false);
    expect(viewFor(dead, "p2", { hostId: "p1" }).moleChat).not.toBeNull(); // can still read
    expect(applyAction(initialState(), { type: "moleChat", body: "hi" }, ctx("p1", 2000, room)).ok).toBe(false);
    expect(applyAction(s, { type: "moleChat", body: "   " }, ctx("p1", 2000, room)).ok).toBe(false);
  });

  it("rate limits, caps the log, and starts fresh each game", () => {
    let s = table(7, roles);
    s = act(s, "p1", { type: "moleChat", body: "one" }, 2000, room);
    expect(applyAction(s, { type: "moleChat", body: "two" }, ctx("p1", 2500, room)).ok).toBe(false);
    for (let i = 0; i < 120; i++) s = act(s, "p1", { type: "moleChat", body: `m${i}` }, 4000 + i * 1000, room);
    expect(s.moleChat).toHaveLength(100);
    expect(s.moleChat.at(-1)?.body).toBe("m119");
    const over = { ...s, phase: "over" as const, winner: "company" as const };
    expect(viewFor(over, "p5", { hostId: "p1" }).moleChat).toHaveLength(100); // everyone reads it at game over
    const next = act(over, "p1", { type: "start" }, 300_000, room);
    expect(next.moleChat).toEqual([]);
  });

  it("mutes the laid-off in the team chat until the game ends", () => {
    const s = table(7, roles);
    const dead = { ...s, seats: s.seats.map((x) => (x.id === "p5" ? { ...x, alive: false } : x)) };
    expect(canTeamChat(dead, "p5")).toBe(false);
    expect(canTeamChat(dead, "p4")).toBe(true);
    expect(canTeamChat(dead, "watcher")).toBe(true);
    expect(canTeamChat({ ...dead, phase: "over" }, "p5")).toBe(true);
    expect(viewFor(dead, "p5", { hostId: "p1" }).canTeamChat).toBe(false);
  });
});

describe("test-room bots", () => {
  const roles: Role[] = ["mole", "mole", "it", "hr", "employee", "employee", "employee"];
  const room = ids(7);
  const run = (s: AllHandsState, skip: string[] = []) => {
    for (const id of room) {
      if (skip.includes(id)) continue;
      const m = botMove(s, id, seq());
      if (m) s = act(s, id, m, 2000, room);
    }
    return s;
  };

  it("plays a whole round with legal moves, Moles backing each other up", () => {
    let s = run(table(7, roles));
    expect(s.phase).toBe("night");
    s = act(s, "p1", { type: "pick", target: "p5" }, 2000, room);
    s = run(s, ["p1"]);
    expect(s.phase).toBe("dawn"); // everyone picked and the Moles agreed
    expect(s.nights[0].moleTarget).toBe("p5");
    s = act(act(s, "p1", { type: "skip", from: "dawn" }, 3000, room), "p1", { type: "skip", from: "day" }, 3000, room);
    s = run(s);
    expect(["exit", "over"]).toContain(s.phase);
  });

  it("has nothing to do outside its turn", () => {
    expect(botMove(initialState(), "p1", seq())).toBeNull();
    const s = table(7, roles);
    expect(botMove(s, "nobody", seq())).toBeNull();
  });
});

describe("the Burnt-out Employee", () => {
  const roles: Role[] = ["mole", "mole", "it", "hr", "burnout", "employee", "employee"];
  const room = ids(7);

  it("is dealt at 7+ when the setting is on, and never below", () => {
    expect(deal(ids(7), seq(), { burnout: true }).filter((x) => x.role === "burnout")).toHaveLength(1);
    expect(deal(ids(16), seq(), { burnout: true }).filter((x) => x.role === "burnout")).toHaveLength(1);
    expect(deal(ids(6), seq(), { burnout: true }).some((x) => x.role === "burnout")).toBe(false);
    expect(deal(ids(9), seq(), { burnout: false }).some((x) => x.role === "burnout")).toBe(false);
    for (let n = 7; n <= 16; n++) expect(deal(ids(n), seq(), { burnout: true }).filter((x) => x.role === "mole")).toHaveLength(molesFor(n));
  });

  it("wins alone when fired at performance review", () => {
    let s: AllHandsState = { ...table(7, roles), phase: "vote", round: 1, votes: {}, endsAt: 5000 };
    for (const v of ["p1", "p2", "p3", "p4", "p6", "p7"]) s = act(s, v, { type: "vote", target: "p5" }, 2000, room);
    s = act(s, "p5", { type: "vote", target: "p1" }, 2000, room);
    expect(s.phase).toBe("exit");
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.phase).toBe("over");
    expect(s.winner).toBe("burnout");
    expect(viewFor(s, "p6", { hostId: "p1" }).winner).toBe("burnout");
  });

  it("gets nothing for a night layoff, and looks like a decoy to everyone", () => {
    let s = toNight(table(7, roles));
    expect(viewFor(s, "p5", { hostId: "p1" }).night?.kind).toBe("decoy");
    expect(viewFor(s, "p1", { hostId: "p1" }).seats.find((x) => x.id === "p5")?.role).toBeNull();
    s = act(s, "p1", { type: "pick", target: "p5" }, 2000, room);
    s = act(s, "p2", { type: "pick", target: "p5" }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p5")?.alive).toBe(false);
    expect(s.winner).toBeNull();
  });

  it("can be switched off between games", () => {
    const s = act(initialState(), "p1", { type: "settings", settings: { burnout: false } });
    expect(s.settings.burnout).toBe(false);
    const started = act(s, "p1", { type: "start" }, 1000, ids(8));
    expect(started.seats.some((x) => x.role === "burnout")).toBe(false);
  });
});

describe("special roles at bigger tables", () => {
  it("deals each one only from its table size, keeping the Mole count", () => {
    const all = { burnout: true, intern: true, nephew: true, recruiter: true };
    for (let n = MIN_PLAYERS; n <= 16; n++) {
      const seats = deal(ids(n), seq(), all);
      const has = (r: Role) => seats.filter((x) => x.role === r).length;
      expect(has("mole") + has("recruiter")).toBe(molesFor(n));
      expect(has("recruiter")).toBe(n >= 9 ? 1 : 0);
      expect(has("intern")).toBe(n >= 6 ? 1 : 0);
      expect(has("nephew")).toBe(n >= 8 ? 1 : 0);
      expect(has("employee")).toBeGreaterThanOrEqual(1);
    }
    expect(deal(ids(12), seq(), {}).some((x) => ["intern", "nephew", "recruiter", "burnout"].includes(x.role))).toBe(false);
  });
});

describe("the Founder's Nephew", () => {
  const roles: Role[] = ["mole", "it", "hr", "nephew", "employee", "employee"];
  const room = ids(6);
  const review = (s: AllHandsState, target: string) => {
    s = { ...s, phase: "vote", votes: {}, endsAt: 99_999 };
    for (const x of s.seats.filter((y) => y.alive)) s = act(s, x.id, { type: "vote", target: x.id === target ? "p1" : target }, 2000, room);
    return s;
  };

  it("survives the first firing, is outed, and goes the second time", () => {
    let s = review({ ...table(6, roles), round: 1 }, "p4");
    expect(s.phase).toBe("exit");
    expect(s.exit?.survived).toBe(true);
    expect(s.seats.find((x) => x.id === "p4")?.alive).toBe(true);
    const v = viewFor(s, "p5", { hostId: "p1" });
    expect(v.exit?.survived).toBe(true);
    expect(v.seats.find((x) => x.id === "p4")?.role).toBe("nephew");
    expect(v.history.at(-1)?.kind).toBe("spared");
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.phase).toBe("night");
    s = review(s, "p4");
    expect(s.exit?.survived).toBe(false);
    expect(s.seats.find((x) => x.id === "p4")?.alive).toBe(false);
  });

  it("still gets laid off at night", () => {
    let s = toNight(table(6, roles));
    s = act(s, "p1", { type: "pick", target: "p4" }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p4")?.alive).toBe(false);
  });
});

describe("the Intern", () => {
  const roles: Role[] = ["mole", "it", "hr", "intern", "employee", "employee"];
  const room = ids(6);

  it("picks a mentor on the first night, then gets the poll, and never learns the mentor's role", () => {
    let s = toNight(table(6, roles));
    const v = viewFor(s, "p4", { hostId: "p1" });
    expect(v.night?.kind).toBe("intern");
    expect(v.night?.targets).not.toContain("p4");
    s = act(s, "p4", { type: "pick", target: "p1" }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p4")?.mentor).toBe("p1");
    const after = viewFor(s, "p4", { hostId: "p1" });
    expect(after.me.mentor).toBe("p1");
    expect(after.seats.find((x) => x.id === "p1")?.role).toBeNull();
    s = { ...s, phase: "exit", exit: { fired: null, votes: 0 }, endsAt: 1 };
    s = advanceState(s, 2).state;
    expect(viewFor(s, "p4", { hostId: "p1" }).night?.kind).toBe("decoy");
  });

  it("wins with the mentor's side, and gets a mentor even without picking", () => {
    let s = toNight(table(6, roles));
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p4")?.mentor).toBe("p5"); // the next coworker along
    const molesMentor = { ...s, seats: s.seats.map((x) => (x.id === "p4" ? { ...x, mentor: "p1" } : x)) };
    expect(teamOf(molesMentor, molesMentor.seats[3])).toBe("moles");
    const over = { ...molesMentor, phase: "over" as const, winner: "moles" as const };
    expect(viewFor(over, "p4", { hostId: "p1" }).winners.sort()).toEqual(["p1", "p4"]);
    expect(viewFor({ ...over, winner: "company" }, "p4", { hostId: "p1" }).winners).not.toContain("p4");
  });

  it("is clean to the IT Guy", () => {
    let s = toNight(table(6, roles));
    s = act(s, "p2", { type: "pick", target: "p4" }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.checks.at(-1)).toEqual({ round: 1, target: "p4", isMole: false });
  });
});

describe("the Recruiter", () => {
  const roles: Role[] = ["recruiter", "mole", "it", "hr", "employee", "employee", "employee", "employee", "employee"];
  const room = ids(9);
  const night = () => toNight(table(9, roles));

  it("is a Mole to the other Moles, the IT Guy and the win check", () => {
    const s = night();
    expect(viewFor(s, "p2", { hostId: "p1" }).seats.find((x) => x.id === "p1")?.role).toBe("recruiter");
    expect(viewFor(s, "p1", { hostId: "p1" }).canMoleChat).toBe(true);
    expect(viewFor(s, "p1", { hostId: "p1" }).night?.canOffer).toBe(true);
    expect(viewFor(s, "p2", { hostId: "p1" }).night?.canOffer).toBe(false);
    expect(viewFor(s, "p5", { hostId: "p1" }).seats.find((x) => x.id === "p1")?.role).toBeNull();
  });

  it("hires instead of laying off; the hire becomes a Mole, sees the team, and nobody else is told", () => {
    let s = night();
    s = act(s, "p2", { type: "pick", target: "p6" }, 2000, room);
    s = act(s, "p1", { type: "pick", target: "p5", offer: true }, 2000, room);
    expect(viewFor(s, "p2", { hostId: "p1" }).night?.offer).toBe("p5");
    expect(viewFor(s, "p5", { hostId: "p1" }).night?.offer).toBeNull();
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p5")?.role).toBe("mole");
    expect(s.seats.every((x) => x.alive)).toBe(true); // no layoff that night
    expect(s.dawn).toEqual({ round: 1, laidOff: null, saved: false });
    const hired = viewFor(s, "p5", { hostId: "p1" });
    expect(hired.dawn?.recruited).toBe(true);
    expect(hired.me.recruited).toBe(true);
    expect(hired.seats.find((x) => x.id === "p2")?.role).toBe("mole");
    expect(hired.canMoleChat).toBe(true);
    expect(viewFor(s, "p6", { hostId: "p1" }).dawn?.recruited).toBe(false);
    expect(s.nights[0]).toMatchObject({ offerTarget: "p5", offerResult: "hired", outcome: "quiet" });
    expect(viewFor(s, "p1", { hostId: "p1" }).night).toBeNull();
    // The offer is spent.
    s = { ...s, phase: "exit", exit: { fired: null, votes: 0 }, endsAt: 1 };
    s = advanceState(s, 2).state;
    expect(viewFor(s, "p1", { hostId: "p1" }).night?.canOffer).toBe(false);
    expect(applyAction(s, { type: "pick", target: "p6", offer: true }, ctx("p1", 3000, room)).ok).toBe(false);
  });

  it("fails on the IT Guy and HR Rep, and HR's paperwork blocks it", () => {
    let s = night();
    s = act(s, "p1", { type: "pick", target: "p3", offer: true }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p3")?.role).toBe("it");
    expect(s.nights[0].offerResult).toBe("refused");

    let t = night();
    t = act(t, "p1", { type: "pick", target: "p6", offer: true }, 2000, room);
    t = act(t, "p4", { type: "pick", target: "p6" }, 2000, room);
    t = advanceState(t, t.endsAt! + 1).state;
    expect(t.seats.find((x) => x.id === "p6")?.role).toBe("employee");
    expect(t.nights[0].offerResult).toBe("blocked");
    expect(t.dawn?.saved).toBe(false); // looks like any quiet night
  });

  it("takes back an offer by making a plain pick", () => {
    let s = night();
    s = act(s, "p1", { type: "pick", target: "p5", offer: true }, 2000, room);
    s = act(s, "p1", { type: "pick", target: "p6" }, 2000, room);
    expect(s.offer).toBeNull();
    s = act(s, "p2", { type: "pick", target: "p6" }, 2000, room);
    s = advanceState(s, s.endsAt! + 1).state;
    expect(s.seats.find((x) => x.id === "p6")?.alive).toBe(false);
    expect(s.seats.find((x) => x.id === "p1")?.offered).toBeFalsy();
  });
});
