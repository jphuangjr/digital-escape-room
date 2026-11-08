import "server-only";
import { promptIds, promptText, replyIds, replyText } from "@/lib/replyall/deck";
import {
  DEFAULT_SETTINGS,
  HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PICK_OPTIONS_MS,
  REPLY_ALL_GAME_ID,
  TARGET_OPTIONS,
  type Phase,
  type ReplyAllAction,
  type ReplyAllView,
  type Settings,
} from "@/lib/replyall/types";
import { definePartyGame, type PartyCtx, type PartyResult } from "../party/registry";

/** How long the pinned reply stays up before the next round starts by itself. */
export const RESULT_MS = 12_000;

export interface Seat {
  id: string;
  /** Reply card ids (see @/lib/replyall/deck). */
  hand: number[];
  score: number;
  /** The round they sat out to draw a fresh hand ("Mark all as read"): they don't reply that round. */
  skippedRound?: number;
}

/** The whole game, every hand included. Stored in Room.scene; never sent to a client as is. */
export interface ReplyAllState {
  v: 1;
  game: typeof REPLY_ALL_GAME_ID;
  phase: Phase;
  round: number;
  endsAt: number | null;
  pausedLeft: number | null;
  settings: Settings;
  /** The table, in join order. */
  seats: Seat[];
  /** The Manager this round is seats[manager]; it moves one seat on each round. */
  manager: number;
  prompt: number | null;
  promptDeck: number[];
  replyDeck: number[];
  /** This round's replies, by player id. `auto`: the timer played it for them. */
  plays: Record<string, { card: number; auto?: boolean }>;
  /** Who wrote each entry on the table: entry i is order[i]'s reply. Shuffled, so the table can't tell. */
  order: string[];
  /** Vote mode: each voter's entry. */
  votes: Record<string, number>;
  result: { winners: string[]; entry: number; byPicker: "manager" | "vote" | "timer" } | null;
  history: { round: number; prompt: number; card: number; winners: string[] }[];
  champions: string[];
  /** The game's own random state, so a timer running out (which has no random source) can still shuffle and deal. */
  rng: number;
}

export function initialState(settings: Settings = DEFAULT_SETTINGS): ReplyAllState {
  return {
    v: 1,
    game: REPLY_ALL_GAME_ID,
    phase: "lobby",
    round: 0,
    endsAt: null,
    pausedLeft: null,
    settings: { ...settings },
    seats: [],
    manager: 0,
    prompt: null,
    promptDeck: [],
    replyDeck: [],
    plays: {},
    order: [],
    votes: {},
    result: null,
    history: [],
    champions: [],
    rng: 1,
  };
}

export function parseState(raw: unknown): ReplyAllState {
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== 1 || (raw as { game?: unknown }).game !== REPLY_ALL_GAME_ID) {
    return initialState();
  }
  const s = raw as Partial<ReplyAllState>;
  const base = initialState(cleanSettings({ ...DEFAULT_SETTINGS, ...(s.settings ?? {}) }));
  return { ...base, ...s, settings: base.settings } as ReplyAllState;
}

function cleanSettings(x: Partial<Settings>): Settings {
  return {
    mode: x.mode === "vote" ? "vote" : "manager",
    target: TARGET_OPTIONS.includes(Number(x.target)) ? Number(x.target) : DEFAULT_SETTINGS.target,
    pickMs: PICK_OPTIONS_MS.includes(Number(x.pickMs)) ? Number(x.pickMs) : DEFAULT_SETTINGS.pickMs,
    afterHours: x.afterHours === true,
  };
}

// ---------- helpers ----------

/** A small seeded generator (mulberry32) that keeps its state on the game. */
function rand(s: ReplyAllState, n: number): number {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
}

function shuffle<T>(s: ReplyAllState, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(s, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clone = (s: ReplyAllState): ReplyAllState => structuredClone(s);

function refuse<S>(state: S, error: string): PartyResult<S> {
  return { state, changed: false, ok: false, error };
}
function done(state: ReplyAllState): PartyResult<ReplyAllState> {
  return { state, changed: true, ok: true };
}

const seatOf = (s: ReplyAllState, id: string) => s.seats.find((x) => x.id === id);
export const managerOf = (s: ReplyAllState): string | null =>
  s.settings.mode === "manager" && s.seats.length ? s.seats[s.manager % s.seats.length].id : null;
/** Who replies this round: everyone but the Manager. */
const repliers = (s: ReplyAllState) => s.seats.filter((x) => x.id !== managerOf(s));
const sittingOut = (s: ReplyAllState, seat: Seat) => seat.skippedRound === s.round;
/** Who still owes a reply this round: the repliers, less anyone who sat it out for a fresh hand. */
const answering = (s: ReplyAllState) => repliers(s).filter((x) => !sittingOut(s, x));
const inGame = (s: ReplyAllState) => s.phase !== "lobby" && s.phase !== "over";

/** Draw one reply card, reshuffling every card nobody holds when the deck runs out. */
function drawReply(s: ReplyAllState): number | null {
  if (!s.replyDeck.length) {
    const held = new Set(s.seats.flatMap((x) => x.hand));
    for (const p of Object.values(s.plays)) held.add(p.card);
    s.replyDeck = shuffle(s, replyIds(s.settings.afterHours).filter((c) => !held.has(c)));
  }
  return s.replyDeck.pop() ?? null;
}

function fillHand(s: ReplyAllState, seat: Seat): void {
  while (seat.hand.length < HAND_SIZE) {
    const c = drawReply(s);
    if (c === null) return;
    seat.hand.push(c);
  }
}

function drawPrompt(s: ReplyAllState): number {
  if (!s.promptDeck.length) s.promptDeck = shuffle(s, promptIds(s.settings.afterHours).filter((p) => p !== s.prompt));
  return s.promptDeck.pop()!;
}

function timed(s: ReplyAllState, phase: Phase, ms: number | null, now: number): ReplyAllState {
  s.phase = phase;
  s.endsAt = ms === null ? null : now + ms;
  s.pausedLeft = null;
  return s;
}

/** Deal everyone back up to a full hand and start a thread. Mutates `s`. */
function startRound(s: ReplyAllState, now: number): ReplyAllState {
  s.round += 1;
  if (s.round > 1) s.manager = (s.manager + 1) % Math.max(1, s.seats.length);
  for (const seat of s.seats) fillHand(s, seat);
  s.prompt = drawPrompt(s);
  s.plays = {};
  s.order = [];
  s.votes = {};
  s.result = null;
  return timed(s, "pick", s.settings.pickMs, now);
}

/** Everyone has replied (or the timer played for the rest): put the replies on the table, shuffled. */
function reveal(s: ReplyAllState, now: number): ReplyAllState {
  for (const seat of answering(s)) {
    if (s.plays[seat.id] || !seat.hand.length) continue;
    const card = seat.hand.splice(rand(s, seat.hand.length), 1)[0];
    s.plays[seat.id] = { card, auto: true };
  }
  s.order = shuffle(s, Object.keys(s.plays));
  // Everyone sat it out: no replies to pick from, so straight on to the next thread.
  if (!s.order.length) return startRound(s, now);
  return timed(s, s.settings.mode === "manager" ? "judge" : "vote", s.settings.pickMs, now);
}

function pin(s: ReplyAllState, entries: number[], byPicker: "manager" | "vote" | "timer", now: number): ReplyAllState {
  const winners = entries.map((e) => s.order[e]).filter(Boolean);
  for (const id of winners) {
    const seat = seatOf(s, id);
    if (seat) seat.score += 1;
  }
  const entry = entries[0] ?? 0;
  s.result = { winners, entry, byPicker };
  s.history.push({ round: s.round, prompt: s.prompt ?? 0, card: s.plays[s.order[entry]]?.card ?? 0, winners });
  return timed(s, "result", RESULT_MS, now);
}

/** Vote mode: the entries with the most votes (all of them on a tie). No votes at all: one at random. */
export function topEntries(s: ReplyAllState): number[] {
  const counts = s.order.map((_, i) => Object.values(s.votes).filter((v) => v === i).length);
  const best = Math.max(0, ...counts);
  if (best === 0) return s.order.length ? [rand(s, s.order.length)] : [];
  return counts.flatMap((c, i) => (c === best ? [i] : []));
}

function finishRound(s: ReplyAllState, now: number): ReplyAllState {
  const best = Math.max(0, ...s.seats.map((x) => x.score));
  if (best >= s.settings.target) {
    s.champions = s.seats.filter((x) => x.score === best).map((x) => x.id);
    s.prompt = null;
    s.plays = {};
    s.order = [];
    return timed(s, "over", null, now);
  }
  return startRound(s, now);
}

/** Move past the current phase: its timer ran out, or everyone has had their turn. Mutates `s`. */
function endPhase(s: ReplyAllState, now: number): ReplyAllState {
  switch (s.phase) {
    case "pick":
      return reveal(s, now);
    case "judge":
      return pin(s, s.order.length ? [rand(s, s.order.length)] : [], "timer", now);
    case "vote":
      return pin(s, topEntries(s), Object.keys(s.votes).length ? "vote" : "timer", now);
    case "result":
      return finishRound(s, now);
    default:
      return s;
  }
}

/** Skip the wait once nobody is left to act. */
function maybeEarly(s: ReplyAllState, now: number): ReplyAllState {
  if (s.phase === "pick" && answering(s).every((x) => s.plays[x.id])) return reveal(s, now);
  if (s.phase === "vote" && s.seats.every((x) => s.votes[x.id] !== undefined || !votableFor(s, x.id).length)) {
    return pin(s, topEntries(s), "vote", now);
  }
  return s;
}

/** The entries this player may vote for: anything but their own. */
function votableFor(s: ReplyAllState, id: string): number[] {
  return s.order.flatMap((pid, i) => (pid === id ? [] : [i]));
}

// ---------- actions ----------

const HOST_ONLY = new Set<ReplyAllAction["type"]>(["start", "settings", "pause", "resume", "end", "kick", "skip"]);

export function applyAction(s0: ReplyAllState, a: ReplyAllAction, ctx: PartyCtx): PartyResult<ReplyAllState> {
  const { playerId: me, now } = ctx;
  if (HOST_ONLY.has(a.type) && me !== ctx.hostId) return refuse(s0, "Only the host can do that.");
  const s = clone(s0);
  const seat = seatOf(s, me);

  switch (a.type) {
    case "tick":
      return advanceState(s0, now);

    case "start": {
      if (inGame(s)) return refuse(s0, "The game is already running.");
      const ids = ctx.roomPlayerIds.slice(0, MAX_PLAYERS);
      if (ids.length < MIN_PLAYERS) return refuse(s0, `You need at least ${MIN_PLAYERS} players to start.`);
      const fresh = initialState(s.settings);
      fresh.rng = ctx.rand(2 ** 31) | 0;
      fresh.seats = ids.map((id) => ({ id, hand: [], score: 0 }));
      fresh.manager = rand(fresh, fresh.seats.length);
      return done(startRound(fresh, now));
    }

    case "settings": {
      if (inGame(s)) return refuse(s0, "Settings can only change between games.");
      s.settings = cleanSettings({ ...s.settings, ...a.settings });
      return done(s);
    }

    case "join": {
      // Someone who arrived mid-game: deal them in now. They reply from the next thread on (or this one, if there's time).
      if (!inGame(s)) return refuse(s0, "Wait for the host to start.");
      if (seat) return { state: s0, changed: false, ok: true };
      if (s.seats.length >= MAX_PLAYERS) return refuse(s0, "This table is full.");
      const newSeat: Seat = { id: me, hand: [], score: 0 };
      s.seats.push(newSeat);
      fillHand(s, newSeat);
      return done(s);
    }

    case "play": {
      if (s.phase !== "pick") return refuse(s0, "It's not time to reply.");
      if (!seat) return refuse(s0, "You're not in this game. Tap Deal me in first.");
      if (me === managerOf(s)) return refuse(s0, "You're the Manager this round. Sit back and judge.");
      if (sittingOut(s, seat)) return refuse(s0, "You're sitting this thread out for a fresh hand. You're back in next thread.");
      const at = seat.hand.indexOf(a.card);
      if (at < 0) return refuse(s0, "That card isn't in your hand.");
      // Changing your mind puts the earlier card back in your hand.
      const prev = s.plays[me];
      seat.hand.splice(at, 1);
      if (prev) seat.hand.splice(at, 0, prev.card);
      s.plays[me] = { card: a.card };
      return done(maybeEarly(s, now));
    }

    case "choose": {
      if (s.phase !== "judge") return refuse(s0, "Nothing to pick right now.");
      if (me !== managerOf(s)) return refuse(s0, "Only this round's Manager picks.");
      if (!Number.isInteger(a.entry) || a.entry < 0 || a.entry >= s.order.length) return refuse(s0, "Pick one of the replies.");
      return done(pin(s, [a.entry], "manager", now));
    }

    case "vote": {
      if (s.phase !== "vote") return refuse(s0, "Voting isn't open.");
      if (!seat) return refuse(s0, "You're not in this game.");
      if (!votableFor(s, me).includes(a.entry)) return refuse(s0, "You can't vote for your own reply.");
      s.votes[me] = a.entry;
      return done(maybeEarly(s, now));
    }

    case "mulligan": {
      // Sit this thread out for a whole new hand. Any round, as often as you like: the price is not replying.
      if (s.phase !== "pick") return refuse(s0, "You can only swap your hand while replying.");
      if (!seat) return refuse(s0, "You're not in this game.");
      if (me === managerOf(s)) return refuse(s0, "The Manager doesn't reply this round anyway.");
      if (sittingOut(s, seat)) return refuse(s0, "You've already got a fresh hand this round.");
      if (s.plays[me]) return refuse(s0, "You've already replied this round.");
      seat.hand = [];
      seat.skippedRound = s.round;
      fillHand(s, seat);
      return done(maybeEarly(s, now));
    }

    case "skip": {
      // The host moves things on: close replies (the timer's auto-replies fill the gaps), pick at random, close the
      // vote, or go to the next thread.
      if (!inGame(s)) return refuse(s0, "Nothing to skip.");
      return done(endPhase(s, now));
    }

    case "pause": {
      if (s.endsAt === null) return refuse(s0, "Nothing to pause.");
      s.pausedLeft = Math.max(0, s.endsAt - now);
      s.endsAt = null;
      return done(s);
    }

    case "resume": {
      if (s.pausedLeft === null) return refuse(s0, "The game isn't paused.");
      s.endsAt = now + s.pausedLeft;
      s.pausedLeft = null;
      return done(s);
    }

    case "end":
      return done(initialState(s.settings));

    case "kick":
      // Removing a player is the route's job (it deletes their Player row); the game only checks it's allowed.
      if (inGame(s)) return refuse(s0, "Players can only be removed between games.");
      if (a.playerId === me) return refuse(s0, "You can't remove yourself.");
      return { state: s0, changed: false, ok: true };
  }
}

export function isDue(s: ReplyAllState, now: number): boolean {
  return s.endsAt !== null && now >= s.endsAt;
}

export function advanceState(s: ReplyAllState, now: number): PartyResult<ReplyAllState> {
  if (!isDue(s, now)) return { state: s, changed: false, ok: true };
  return done(endPhase(clone(s), now));
}

export function parseAction(body: Record<string, unknown>): ReplyAllAction | null {
  const num = (k: string) => (typeof body[k] === "number" && Number.isInteger(body[k]) ? (body[k] as number) : null);
  switch (body.type) {
    case "start":
    case "tick":
    case "skip":
    case "pause":
    case "resume":
    case "end":
    case "join":
    case "mulligan":
      return { type: body.type };
    case "settings":
      return body.settings && typeof body.settings === "object" ? { type: "settings", settings: body.settings as Partial<Settings> } : null;
    case "play": {
      const card = num("card");
      return card === null ? null : { type: "play", card };
    }
    case "choose":
    case "vote": {
      const entry = num("entry");
      return entry === null ? null : { type: body.type, entry };
    }
    case "kick":
      return typeof body.playerId === "string" ? { type: "kick", playerId: body.playerId } : null;
    default:
      return null;
  }
}

// ---------- views ----------

export function viewFor(s: ReplyAllState, viewerId: string, ctx: { hostId: string | null }): ReplyAllView {
  const me = seatOf(s, viewerId);
  const managerId = inGame(s) ? managerOf(s) : null;
  const shown = s.phase === "judge" || s.phase === "vote" || s.phase === "result";
  const final = s.phase === "result";
  const votesFor = (i: number) => Object.values(s.votes).filter((v) => v === i).length;
  return {
    game: REPLY_ALL_GAME_ID,
    phase: s.phase,
    round: s.round,
    endsAt: s.endsAt === null ? null : new Date(s.endsAt).toISOString(),
    paused: s.pausedLeft !== null,
    remainingMs: s.pausedLeft,
    hostId: ctx.hostId,
    settings: s.settings,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    seats: s.seats.map((x) => ({
      id: x.id,
      score: x.score,
      isManager: x.id === managerId,
      skipped: s.phase === "pick" && sittingOut(s, x),
      done: s.phase === "pick" ? Boolean(s.plays[x.id]) || sittingOut(s, x) : s.phase === "vote" ? s.votes[x.id] !== undefined : false,
    })),
    managerId,
    prompt: s.prompt === null ? null : promptText(s.prompt),
    me: {
      seated: Boolean(me),
      isManager: viewerId === managerId,
      hand: (me?.hand ?? []).map((card) => ({ card, text: replyText(card) })),
      played: s.plays[viewerId]?.card ?? null,
      playedText: s.plays[viewerId] ? replyText(s.plays[viewerId].card) : null,
      skipped: Boolean(me && s.phase === "pick" && sittingOut(s, me)),
      canSkip: Boolean(me && s.phase === "pick" && viewerId !== managerId && !sittingOut(s, me) && !s.plays[viewerId]),
      voted: s.votes[viewerId] ?? null,
    },
    entries: shown
      ? s.order.map((pid, i) => ({
          entry: i,
          text: replyText(s.plays[pid]?.card ?? 0),
          mine: pid === viewerId,
          ...(final ? { by: pid, auto: Boolean(s.plays[pid]?.auto), ...(s.settings.mode === "vote" ? { votes: votesFor(i) } : {}) } : {}),
        }))
      : null,
    result: final ? s.result : null,
    history: s.history.map((h) => ({ round: h.round, prompt: promptText(h.prompt), reply: replyText(h.card), winners: h.winners })),
    champions: s.champions,
  };
}

/** What a bot in a test room does now: reply with a random card, pick a random reply, or vote for one. */
export function botMove(s: ReplyAllState, id: string, r: (n: number) => number): ReplyAllAction | null {
  const seat = seatOf(s, id);
  if (!seat) return null;
  if (s.phase === "pick" && id !== managerOf(s) && !s.plays[id] && !sittingOut(s, seat) && seat.hand.length) return { type: "play", card: seat.hand[r(seat.hand.length)] };
  if (s.phase === "judge" && id === managerOf(s) && s.order.length) return { type: "choose", entry: r(s.order.length) };
  if (s.phase === "vote" && s.votes[id] === undefined) {
    const options = votableFor(s, id);
    return options.length ? { type: "vote", entry: options[r(options.length)] } : null;
  }
  return null;
}

export const replyAllGame = definePartyGame<ReplyAllState, Record<string, unknown>, ReplyAllView>({
  id: REPLY_ALL_GAME_ID,
  maxPlayers: MAX_PLAYERS,
  parse: parseState,
  isAction: (body) => parseAction(body) !== null,
  apply: (state, body, ctx) => {
    const action = parseAction(body);
    return action ? applyAction(state, action, ctx) : refuse(state, "Unknown action.");
  },
  due: isDue,
  advance: advanceState,
  view: viewFor,
  isOver: (s) => s.phase === "over",
  botMove: (s, id, r) => botMove(s, id, r) as Record<string, unknown> | null,
});
