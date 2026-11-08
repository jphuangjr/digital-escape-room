import { describe, expect, it } from "vitest";
import { PROMPTS, REPLIES } from "@/lib/replyall/cards";
import { AFTER_HOURS_PROMPTS, AFTER_HOURS_REPLIES } from "@/lib/replyall/afterHours";
import { isAfterHours, replyText } from "@/lib/replyall/deck";
import { HAND_SIZE, fillText, type ReplyAllAction } from "@/lib/replyall/types";
import { RESULT_MS, advanceState, applyAction, botMove, initialState, managerOf, parseAction, parseState, viewFor, type ReplyAllState } from "../replyall/game";
import type { PartyCtx } from "../party/registry";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const seq = () => {
  let i = 7;
  return (n: number) => (i = (i * 31 + 11) % 997) % n;
};
const ctx = (playerId: string, now: number, room = ids(4), hostId = "p1"): PartyCtx => ({ playerId, hostId, roomPlayerIds: room, now, rand: seq() });

function act(s: ReplyAllState, who: string, a: ReplyAllAction, now = 1000, room = ids(4)) {
  return applyAction(s, a, ctx(who, now, room));
}
function must(s: ReplyAllState, who: string, a: ReplyAllAction, now = 1000, room = ids(4)): ReplyAllState {
  const r = act(s, who, a, now, room);
  if (!r.ok) throw new Error(r.error);
  return r.state;
}
function started(n = 4, settings = {}): ReplyAllState {
  let s = initialState();
  if (Object.keys(settings).length) s = must(s, "p1", { type: "settings", settings }, 1000, ids(n));
  return must(s, "p1", { type: "start" }, 1000, ids(n));
}
/** Every replier plays their first card. */
function allPlay(s: ReplyAllState, now = 2000): ReplyAllState {
  for (const seat of s.seats) {
    if (seat.id === managerOf(s) || s.phase !== "pick" || seat.skippedRound === s.round) continue;
    s = must(s, seat.id, { type: "play", card: seat.hand[0] }, now, s.seats.map((x) => x.id));
  }
  return s;
}

describe("cards", () => {
  it("has plenty of original cards and no duplicates", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(60);
    expect(REPLIES.length).toBeGreaterThanOrEqual(200);
    expect(new Set(PROMPTS).size).toBe(PROMPTS.length);
    expect(new Set(REPLIES).size).toBe(REPLIES.length);
    for (const p of PROMPTS) expect(p.split("____").length).toBeLessThanOrEqual(2);
  });

  it("fills a prompt, capitalising at the start of a sentence", () => {
    expect(fillText("Per my last email, ____.", "a meeting about the meeting")).toBe("Per my last email, a meeting about the meeting.");
    expect(fillText("Brad's out-of-office reply just says: ____.", "pizza instead of raises")).toBe("Brad's out-of-office reply just says: Pizza instead of raises.");
    expect(fillText("What got #random archived?", "blaming the intern")).toBe("What got #random archived? Blaming the intern");
    expect(fillText("Breaking: Synergr pivots to ____.", "surprise! It's a pivot")).toBe("Breaking: Synergr pivots to surprise! It's a pivot.");
  });
});

describe("Reply All", () => {
  it("needs three players and deals everyone a full hand", () => {
    expect(act(initialState(), "p1", { type: "start" }, 1000, ids(2)).ok).toBe(false);
    const s = started(4);
    expect(s.phase).toBe("pick");
    expect(s.round).toBe(1);
    expect(s.prompt).not.toBeNull();
    for (const seat of s.seats) expect(seat.hand).toHaveLength(HAND_SIZE);
    const all = s.seats.flatMap((x) => x.hand);
    expect(new Set(all).size).toBe(all.length);
  });

  it("only the host starts and changes settings", () => {
    expect(act(initialState(), "p2", { type: "start" }).ok).toBe(false);
    expect(act(initialState(), "p2", { type: "settings", settings: { target: 3 } }).ok).toBe(false);
    const s = must(initialState(), "p1", { type: "settings", settings: { target: 3, mode: "vote", pickMs: 1 } });
    expect(s.settings).toEqual({ target: 3, mode: "vote", pickMs: 90_000, afterHours: false });
  });

  it("runs a Manager round: replies, an anonymous table, a pin and the next thread", () => {
    let s = started(4);
    const mgr = managerOf(s)!;
    expect(act(s, mgr, { type: "play", card: s.seats.find((x) => x.id === mgr)!.hand[0] }).ok).toBe(false);
    s = allPlay(s);
    expect(s.phase).toBe("judge");
    expect(s.order).toHaveLength(3);
    expect(s.order).not.toContain(mgr);

    // Nobody sees who wrote what yet, but each writer sees their own.
    const other = s.seats.find((x) => x.id !== mgr)!.id;
    const v = viewFor(s, other, { hostId: "p1" });
    expect(v.entries).toHaveLength(3);
    expect(v.entries!.every((e) => e.by === undefined)).toBe(true);
    expect(v.entries!.filter((e) => e.mine)).toHaveLength(1);

    expect(act(s, other, { type: "choose", entry: 0 }).ok).toBe(false);
    s = must(s, mgr, { type: "choose", entry: 1 });
    expect(s.phase).toBe("result");
    const winner = s.order[1];
    expect(s.seats.find((x) => x.id === winner)!.score).toBe(1);
    const rv = viewFor(s, mgr, { hostId: "p1" });
    expect(rv.entries!.every((e) => e.by)).toBe(true);
    expect(rv.result?.winners).toEqual([winner]);

    const next = advanceState(s, 1000 + RESULT_MS).state;
    expect(next.phase).toBe("pick");
    expect(next.round).toBe(2);
    expect(managerOf(next)).not.toBe(mgr);
    for (const seat of next.seats) expect(seat.hand).toHaveLength(HAND_SIZE);
  });

  it("lets a player change their reply until everyone is in", () => {
    let s = started(4);
    const me = s.seats.find((x) => x.id !== managerOf(s))!;
    const [a, b] = me.hand;
    s = must(s, me.id, { type: "play", card: a });
    s = must(s, me.id, { type: "play", card: b });
    const after = s.seats.find((x) => x.id === me.id)!;
    expect(s.plays[me.id].card).toBe(b);
    expect(after.hand).toContain(a);
    expect(after.hand).not.toContain(b);
    expect(after.hand).toHaveLength(HAND_SIZE - 1);
  });

  it("auto-replies for anyone who runs out of time, and picks at random if the Manager does", () => {
    let s = started(5);
    const late = s.seats.filter((x) => x.id !== managerOf(s));
    s = must(s, late[0].id, { type: "play", card: late[0].hand[0] });
    s = advanceState(s, s.endsAt!).state;
    expect(s.phase).toBe("judge");
    expect(s.order).toHaveLength(4);
    expect(Object.values(s.plays).filter((p) => p.auto)).toHaveLength(3);
    s = advanceState(s, s.endsAt!).state;
    expect(s.phase).toBe("result");
    expect(s.result?.byPicker).toBe("timer");
    expect(s.seats.reduce((n, x) => n + x.score, 0)).toBe(1);
  });

  it("vote mode: everyone replies, nobody votes for their own, ties share the pin", () => {
    let s = started(4, { mode: "vote" });
    expect(managerOf(s)).toBeNull();
    s = allPlay(s);
    expect(s.phase).toBe("vote");
    expect(s.order).toHaveLength(4);
    const own = (id: string) => s.order.indexOf(id);
    expect(act(s, "p1", { type: "vote", entry: own("p1") }).ok).toBe(false);
    // p1 and p2 vote for p3; p3 and p4 vote for p1: a tie between p3 and p1.
    s = must(s, "p1", { type: "vote", entry: own("p3") });
    s = must(s, "p2", { type: "vote", entry: own("p3") });
    s = must(s, "p3", { type: "vote", entry: own("p1") });
    s = must(s, "p4", { type: "vote", entry: own("p1") });
    expect(s.phase).toBe("result");
    expect([...s.result!.winners].sort()).toEqual(["p1", "p3"]);
    expect(viewFor(s, "p2", { hostId: "p1" }).entries!.find((e) => e.by === "p3")!.votes).toBe(2);
  });

  it("ends when someone reaches the target", () => {
    let s = started(3, { target: 3 });
    for (let i = 0; i < 20 && s.phase !== "over"; i++) {
      s = allPlay(s, 1000);
      s = must(s, managerOf(s)!, { type: "choose", entry: 0 }, 1000, ids(3));
      s = must(s, "p1", { type: "skip" }, 1000, ids(3));
    }
    expect(s.phase).toBe("over");
    expect(s.champions.length).toBeGreaterThan(0);
    for (const id of s.champions) expect(s.seats.find((x) => x.id === id)!.score).toBe(3);
    expect(s.history.length).toBeGreaterThanOrEqual(3);
  });

  it("lets a player skip a thread for a fresh hand, any round", () => {
    let s = started(4);
    const mgr = managerOf(s)!;
    const me = s.seats.find((x) => x.id !== mgr)!;
    expect(act(s, mgr, { type: "mulligan" }).ok).toBe(false);
    s = must(s, me.id, { type: "mulligan" });
    const fresh = s.seats.find((x) => x.id === me.id)!.hand;
    expect(fresh).toHaveLength(HAND_SIZE);
    expect(fresh.some((c) => me.hand.includes(c))).toBe(false);
    expect(viewFor(s, me.id, { hostId: "p1" }).me.skipped).toBe(true);
    expect(act(s, me.id, { type: "mulligan" }).ok).toBe(false);
    expect(act(s, me.id, { type: "play", card: fresh[0] }).ok).toBe(false);

    // The round goes on without them: once the others reply, the table has two replies, not three.
    s = allPlay(s);
    expect(s.phase).toBe("judge");
    expect(s.order).toHaveLength(2);
    expect(s.order).not.toContain(me.id);

    // Next round they can skip again.
    s = must(s, managerOf(s)!, { type: "choose", entry: 0 });
    s = must(s, "p1", { type: "skip" });
    const again = s.seats.find((x) => x.id !== managerOf(s))!;
    expect(act(s, again.id, { type: "mulligan" }).ok).toBe(true);
  });

  it("moves to the next thread if everyone skips", () => {
    let s = started(3);
    for (const seat of s.seats) if (seat.id !== managerOf(s)) s = must(s, seat.id, { type: "mulligan" }, 1000, ids(3));
    expect(s.phase).toBe("pick");
    expect(s.round).toBe(2);
  });

  it("deals in someone who arrives mid-game", () => {
    let s = started(3);
    expect(viewFor(s, "p4", { hostId: "p1" }).me.seated).toBe(false);
    s = must(s, "p4", { type: "join" }, 1000, ids(4));
    expect(s.seats).toHaveLength(4);
    expect(viewFor(s, "p4", { hostId: "p1" }).me.hand).toHaveLength(HAND_SIZE);
  });

  it("keeps other hands secret", () => {
    const s = started(4);
    const v = viewFor(s, "p2", { hostId: "p1" });
    expect(v.me.hand.map((c) => c.card)).toEqual(s.seats.find((x) => x.id === "p2")!.hand);
    expect(JSON.stringify(v)).not.toContain(JSON.stringify(s.seats.find((x) => x.id === "p3")!.hand));
    expect(v.entries).toBeNull();
  });

  it("bots can play a whole round", () => {
    let s = started(5, { mode: "manager" });
    const r = seq();
    for (let guard = 0; guard < 20 && s.phase !== "result"; guard++) {
      for (const seat of s.seats) {
        const m = botMove(s, seat.id, r);
        if (m) s = must(s, seat.id, m, 1000, ids(5));
      }
    }
    expect(s.phase).toBe("result");
  });

  it("keeps the 18+ After Hours cards out unless the host turns them on", () => {
    for (const list of [AFTER_HOURS_PROMPTS, AFTER_HOURS_REPLIES]) expect(new Set(list).size).toBe(list.length);
    expect(AFTER_HOURS_REPLIES.length).toBeGreaterThanOrEqual(100);
    const dealt = (s: ReplyAllState) => [...s.seats.flatMap((x) => x.hand), ...s.replyDeck, ...s.promptDeck, s.prompt!];

    const office = started(6);
    expect(office.settings.afterHours).toBe(false);
    expect(dealt(office).some(isAfterHours)).toBe(false);

    const adult = started(6, { afterHours: true });
    expect(dealt(adult).some(isAfterHours)).toBe(true);
    expect(dealt(adult).some((c) => !isAfterHours(c))).toBe(true);
    const v = viewFor(adult, "p2", { hostId: "p1" });
    for (const c of v.me.hand) expect(c.text).toBe(replyText(c.card));
    expect(v.me.hand.every((c) => c.text.length > 0)).toBe(true);
    expect(act(adult, "p2", { type: "settings", settings: { afterHours: false } }).ok).toBe(false);
  });

  it("parses actions and tolerates an empty or foreign scene", () => {
    expect(parseAction({ type: "play", card: 3 })).toEqual({ type: "play", card: 3 });
    expect(parseAction({ type: "play", card: "3" })).toBeNull();
    expect(parseAction({ type: "pick" })).toBeNull();
    expect(parseState(null).phase).toBe("lobby");
    expect(parseState({ v: 1, phase: "night" }).phase).toBe("lobby");
  });
});
