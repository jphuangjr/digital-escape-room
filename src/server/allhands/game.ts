import "server-only";
import {
  ALL_HANDS_GAME_ID,
  isMoleRole,
  specialsFor,
  DAY_OPTIONS_MS,
  DECOY_PROMPTS,
  DEFAULT_SETTINGS,
  JOB_TITLES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MOLE_CHAT_MAX,
  SKIP,
  molesFor,
  type AllHandsAction,
  type AllHandsView,
  type HistoryEntry,
  type NightKind,
  type NightRecord,
  type Phase,
  type Role,
  type SeatView,
  type Settings,
  type Team,
} from "@/lib/allhands/types";
import { lineupFor, lineupIssues, lineupRoles, parseLineup, swapRole, type RoleCounts } from "@/lib/allhands/lineup";
import { CHAT_MIN_INTERVAL_MS, cleanChatBody, maskProfanity } from "../logic";
import { definePartyGame, type PartyCtx, type PartyResult } from "../party/registry";

/** How long the untimed-by-setting phases last. */
export const REVEAL_MS = 90_000;
export const DAWN_MS = 8_000;
export const EXIT_MS = 7_000;

export interface Seat {
  id: string;
  role: Role;
  title: string;
  alive: boolean;
  ready: boolean;
  /** The Intern: who they picked as their mentor. */
  mentor?: string;
  /** The Founder's Nephew: survived being voted out (once), and their role is public. */
  spared?: boolean;
  /** The Recruiter: made their one offer. */
  offered?: boolean;
  /** Was hired by the Recruiter, in this round. */
  recruitedRound?: number;
}

/** The whole game, roles included. Stored in Room.scene; never sent to a client as is. */
export interface AllHandsState {
  v: 1;
  phase: Phase;
  /** Night number: 1 for the first night. 0 before it. */
  round: number;
  /** When the current phase ends (ms since epoch); null in the lobby, at game over, or while paused. */
  endsAt: number | null;
  /** While paused: what was left on the clock. */
  pausedLeft: number | null;
  settings: Settings;
  /** The table, in join order. */
  seats: Seat[];
  /** Tonight's picks, by player id. */
  picks: Record<string, string>;
  /** Who HR protected last night. */
  lastProtected: string | null;
  /** Performance-review votes, by voter id: a player id or "skip". */
  votes: Record<string, string>;
  /** What the IT Guy has learned. */
  checks: { round: number; target: string; isMole: boolean }[];
  dawn: { round: number; laidOff: string | null; saved: boolean } | null;
  exit: { fired: string | null; votes: number; survived?: boolean } | null;
  history: { round: number; kind: HistoryEntry["kind"]; playerId: string | null }[];
  nights: NightRecord[];
  winner: Team | null;
  /** Tonight's offer from the Recruiter (instead of a layoff), if they're making one. */
  offer: string | null;
  /** The Moles' back channel for this game (original text; masked in views). */
  moleChat: { id: string; from: string; body: string; at: number }[];
  /** The table's custom role lineup, if anyone in the lobby changed it; null deals the recommended one. Kept between games. */
  lineup?: RoleCounts | null;
}

export function initialState(settings: Settings = DEFAULT_SETTINGS): AllHandsState {
  return {
    v: 1,
    phase: "lobby",
    round: 0,
    endsAt: null,
    pausedLeft: null,
    settings: { ...settings },
    seats: [],
    picks: {},
    lastProtected: null,
    votes: {},
    checks: [],
    dawn: null,
    exit: null,
    history: [],
    nights: [],
    winner: null,
    moleChat: [],
    offer: null,
    lineup: null,
  };
}

export function parseState(raw: unknown): AllHandsState {
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== 1) return initialState();
  const s = raw as Partial<AllHandsState>;
  const base = initialState({ ...DEFAULT_SETTINGS, ...(s.settings ?? {}) });
  return { ...base, ...s, settings: base.settings, lineup: parseLineup(s.lineup) } as AllHandsState;
}

// ---------- helpers ----------

function shuffle<T>(xs: readonly T[], rand: (n: number) => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const seatOf = (s: AllHandsState, id: string) => s.seats.find((x) => x.id === id);
const living = (s: AllHandsState) => s.seats.filter((x) => x.alive);
const isAliveId = (s: AllHandsState, id: string) => seatOf(s, id)?.alive === true;

function refuse<S>(state: S, error: string): PartyResult<S> {
  return { state, changed: false, ok: false, error };
}
function done(state: AllHandsState): PartyResult<AllHandsState> {
  return { state, changed: true, ok: true };
}

/** Which side has won, if any: the company once every Mole is gone, the Moles once they match the rest. */
export function winnerOf(s: AllHandsState): Team | null {
  const alive = living(s);
  const moles = alive.filter((x) => isMoleRole(x.role)).length;
  if (moles === 0) return "company";
  if (moles >= alive.length - moles) return "moles";
  return null;
}

function nightKind(s: AllHandsState, seat: Seat): NightKind {
  if (isMoleRole(seat.role)) return "mole";
  if (seat.role === "it" || seat.role === "hr") return seat.role;
  // The Intern picks a mentor on their first night (or the first night they haven't got one); then it's the poll.
  if (seat.role === "intern" && !seat.mentor) return "intern";
  return "decoy";
}

/** Who the Recruiter could make an offer to: any living player not on the Moles' side. */
function offerTargets(s: AllHandsState): string[] {
  return living(s)
    .filter((x) => !isMoleRole(x.role))
    .map((x) => x.id);
}

/** Which side a player plays for: the Intern's is their mentor's (a departed mentor still counts). */
export function teamOf(s: AllHandsState, seat: Seat): Team {
  if (isMoleRole(seat.role)) return "moles";
  if (seat.role === "burnout") return "burnout";
  if (seat.role === "intern") {
    const mentor = seat.mentor ? seatOf(s, seat.mentor) : undefined;
    return mentor && mentor.role !== "intern" ? teamOf(s, mentor) : "company";
  }
  return "company";
}

/** Who a living player may pick tonight. */
export function nightTargets(s: AllHandsState, seat: Seat): string[] {
  const alive = living(s);
  if (isMoleRole(seat.role)) return alive.filter((x) => !isMoleRole(x.role)).map((x) => x.id);
  switch (seat.role) {
    case "hr":
      return alive.filter((x) => x.id !== s.lastProtected).map((x) => x.id);
    default:
      return alive.filter((x) => x.id !== seat.id).map((x) => x.id);
  }
}

/** The Moles' choice: the most-picked target; a tie goes to the pick of the Mole seated first. */
export function moleChoice(s: AllHandsState): string | null {
  const moles = living(s).filter((x) => isMoleRole(x.role));
  const counts = new Map<string, number>();
  for (const m of moles) {
    const p = s.picks[m.id];
    if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  const best = Math.max(...counts.values());
  for (const m of moles) {
    const p = s.picks[m.id];
    if (p && counts.get(p) === best) return p;
  }
  return null;
}

function timed(s: AllHandsState, phase: Phase, ms: number | null, now: number): AllHandsState {
  return { ...s, phase, endsAt: ms === null ? null : now + ms, pausedLeft: null };
}

// ---------- phase transitions ----------

function startNight(s: AllHandsState, now: number): AllHandsState {
  return timed({ ...s, round: s.round + 1, picks: {}, votes: {}, offer: null, dawn: null, exit: null }, "night", s.settings.nightMs, now);
}

function resolveNight(s: AllHandsState, now: number): AllHandsState {
  const alive = living(s);
  const it = alive.find((x) => x.role === "it");
  const hr = alive.find((x) => x.role === "hr");
  const recruiter = alive.find((x) => x.role === "recruiter");
  const itTarget = it ? (s.picks[it.id] ?? null) : null;
  const hrTarget = hr ? (s.picks[hr.id] ?? null) : null;
  // IT reads tonight's DMs before any offer is signed.
  const itResult = itTarget ? isMoleRole(seatOf(s, itTarget)?.role) : null;

  // The Recruiter's offer replaces tonight's layoff. It fails on IT and HR, and HR's paperwork blocks it.
  const offerTarget = recruiter && !recruiter.offered && s.offer && isAliveId(s, s.offer) ? s.offer : null;
  const offerSeat = offerTarget ? seatOf(s, offerTarget) : undefined;
  const offerResult: NightRecord["offerResult"] = !offerSeat
    ? null
    : offerSeat.id === hrTarget
      ? "blocked"
      : offerSeat.role === "it" || offerSeat.role === "hr" || isMoleRole(offerSeat.role)
        ? "refused"
        : "hired";
  const target = offerTarget ? null : moleChoice(s);
  const outcome: NightRecord["outcome"] = !target ? "quiet" : target === hrTarget ? "saved" : "laidoff";

  // A layoff, and a hire if the offer went through.
  const seats = s.seats.map((x) => {
    let y = x;
    if (outcome === "laidoff" && x.id === target) y = { ...y, alive: false };
    if (offerTarget && x.id === recruiter?.id) y = { ...y, offered: true };
    if (offerResult === "hired" && x.id === offerTarget) {
      y = { ...y, role: "mole", recruitedRound: s.round, mentor: undefined, spared: undefined };
    }
    return y;
  });
  // An Intern picks their mentor on their first night; one who didn't gets the first coworker beside them.
  const withMentor = seats.map((x) => {
    if (x.role !== "intern" || x.mentor || !x.alive) return x;
    const pick = s.picks[x.id];
    const fallback = seats.find((y, i) => y.id !== x.id && y.alive && i > seats.indexOf(x)) ?? seats.find((y) => y.id !== x.id && y.alive);
    return { ...x, mentor: pick ?? fallback?.id };
  });
  const next: AllHandsState = {
    ...s,
    seats: withMentor,
    picks: {},
    offer: null,
    lastProtected: hrTarget,
    checks: itTarget ? [...s.checks, { round: s.round, target: itTarget, isMole: Boolean(itResult) }] : s.checks,
    dawn: { round: s.round, laidOff: outcome === "laidoff" ? target : null, saved: outcome === "saved" },
    history: [...s.history, { round: s.round, kind: outcome, playerId: outcome === "laidoff" ? target : null }],
    nights: [...s.nights, { round: s.round, moleTarget: target, itTarget, itResult, hrTarget, offerTarget, offerResult, outcome }],
  };
  return timed(next, "dawn", DAWN_MS, now);
}

/** The review's result: the most-voted player, if they beat every other player and "let's circle back". */
export function reviewResult(s: AllHandsState): { fired: string | null; votes: number } {
  const counts = new Map<string, number>();
  for (const [voter, target] of Object.entries(s.votes)) {
    if (!isAliveId(s, voter)) continue;
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  const skips = counts.get(SKIP) ?? 0;
  counts.delete(SKIP);
  let fired: string | null = null;
  let best = 0;
  let tied = false;
  for (const [id, n] of counts) {
    if (n > best) {
      best = n;
      fired = id;
      tied = false;
    } else if (n === best) tied = true;
  }
  if (!fired || tied || best <= skips) return { fired: null, votes: best };
  return { fired, votes: best };
}

function resolveVote(s: AllHandsState, now: number): AllHandsState {
  const r = reviewResult(s);
  const firedSeat = r.fired ? seatOf(s, r.fired) : undefined;
  // The Founder's Nephew survives his first firing, and everyone learns who he is.
  const survived = firedSeat?.role === "nephew" && !firedSeat.spared;
  const seats = s.seats.map((x) => (x.id !== r.fired ? x : survived ? { ...x, spared: true } : { ...x, alive: false }));
  return timed(
    {
      ...s,
      seats,
      exit: { ...r, survived },
      history: [...s.history, { round: s.round, kind: survived ? "spared" : r.fired ? "fired" : "kept", playerId: r.fired }],
    },
    "exit",
    EXIT_MS,
    now,
  );
}

function gameOver(s: AllHandsState, winner: Team): AllHandsState {
  return { ...s, phase: "over", endsAt: null, pausedLeft: null, winner, picks: {}, votes: {} };
}

/** End the current phase now and move to the next. */
export function endPhase(s: AllHandsState, now: number): AllHandsState {
  switch (s.phase) {
    case "reveal":
      return startNight(s, now);
    case "night": {
      const next = resolveNight(s, now);
      const w = winnerOf(next);
      // Show the morning news first; the win check after dawn ends the game.
      return w ? { ...next, winner: w } : next;
    }
    case "dawn":
      return s.winner ? gameOver(s, s.winner) : timed(s, "day", s.settings.dayMs, now);
    case "day":
      return timed({ ...s, votes: {} }, "vote", s.settings.voteMs, now);
    case "vote":
      return resolveVote(s, now);
    case "exit": {
      // The Burnt-out Employee got what they wanted: the game ends and they win alone.
      if (s.exit?.fired && !s.exit.survived && seatOf(s, s.exit.fired)?.role === "burnout") return gameOver(s, "burnout");
      const w = winnerOf(s);
      return w ? gameOver(s, w) : startNight(s, now);
    }
    default:
      return s;
  }
}

/** Ends a phase early once everyone it waits on has acted. */
function maybeEarly(s: AllHandsState, now: number): AllHandsState {
  if (s.pausedLeft !== null) return s;
  const alive = living(s);
  if (s.phase === "reveal" && s.seats.every((x) => x.ready)) return endPhase(s, now);
  if (s.phase === "night") {
    const allPicked = alive.every((x) => s.picks[x.id]);
    const moles = alive.filter((x) => isMoleRole(x.role));
    // With an offer on the table there's no layoff to agree on.
    const agreed = s.offer !== null || new Set(moles.map((m) => s.picks[m.id])).size <= 1;
    if (allPicked && agreed) return endPhase(s, now);
  }
  if (s.phase === "vote" && alive.every((x) => s.votes[x.id])) return endPhase(s, now);
  return s;
}

// ---------- actions ----------

export interface DealOptions {
  burnout?: boolean;
  intern?: boolean;
  nephew?: boolean;
  recruiter?: boolean;
}

export function deal(roomPlayerIds: string[], rand: (n: number) => number, opts: DealOptions = {}): Seat[] {
  const ids = roomPlayerIds.slice(0, MAX_PLAYERS);
  const n = ids.length;
  const moles = molesFor(n);
  const specials = specialsFor(n, { burnout: false, intern: false, nephew: false, recruiter: false, ...opts });
  const roles: Role[] = [];
  // The Recruiter is one of the Moles; the others take Employees' seats.
  for (let i = 0; i < moles; i++) roles.push(i === 0 && specials.includes("recruiter") ? "recruiter" : "mole");
  roles.push("it", "hr", ...specials.filter((r) => r !== "recruiter"));
  while (roles.length < n) roles.push("employee");
  const dealt = shuffle(roles.slice(0, n), rand);
  const titles = shuffle(JOB_TITLES, rand);
  return ids.map((id, i) => ({ id, role: dealt[i], title: titles[i % titles.length], alive: true, ready: false }));
}

/** Deal exactly these roles (one per player, as many as there are players) in a random order. */
export function dealRoles(roomPlayerIds: string[], roles: Role[], rand: (n: number) => number): Seat[] {
  const ids = roomPlayerIds.slice(0, MAX_PLAYERS);
  const dealt = shuffle(roles.slice(0, ids.length), rand);
  const titles = shuffle(JOB_TITLES, rand);
  return ids.map((id, i) => ({ id, role: dealt[i] ?? "employee", title: titles[i % titles.length], alive: true, ready: false }));
}

const HOST_ONLY = new Set(["start", "settings", "skip", "pause", "resume", "end"]);

export function applyAction(s: AllHandsState, a: AllHandsAction, ctx: PartyCtx): PartyResult<AllHandsState> {
  const { playerId: me, now } = ctx;
  if (HOST_ONLY.has(a.type) && me !== ctx.hostId) return refuse(s, "Only the host can do that.");
  const seat = seatOf(s, me);

  switch (a.type) {
    case "tick":
      return advanceState(s, now);

    case "start": {
      if (s.phase !== "lobby" && s.phase !== "over") return refuse(s, "The game is already running.");
      if (ctx.roomPlayerIds.length < MIN_PLAYERS) return refuse(s, `You need at least ${MIN_PLAYERS} players to start.`);
      const fresh = { ...initialState(s.settings), lineup: s.lineup ?? null };
      const lineup = lineupFor(ctx.roomPlayerIds.length, s.settings, s.lineup ?? null);
      const blocked = lineupIssues(lineup).find((x) => x.level === "block");
      const roles = lineupRoles(lineup);
      if (blocked || !roles) return refuse(s, blocked?.text ?? "The lineup doesn't fit this table.");
      return done(timed({ ...fresh, seats: dealRoles(ctx.roomPlayerIds, roles, ctx.rand) }, "reveal", REVEAL_MS, now));
    }

    case "settings": {
      if (s.phase !== "lobby" && s.phase !== "over") return refuse(s, "Settings can only change between games.");
      const next = { ...s.settings };
      const p = a.settings;
      if (typeof p.revealOnFire === "boolean") next.revealOnFire = p.revealOnFire;
      for (const k of ["burnout", "intern", "nephew", "recruiter"] as const) if (typeof p[k] === "boolean") next[k] = p[k];
      if (typeof p.dayMs === "number" && DAY_OPTIONS_MS.includes(p.dayMs)) next.dayMs = p.dayMs;
      return done({ ...s, settings: next });
    }

    case "ready": {
      if (s.phase !== "reveal" || !seat) return refuse(s, "Nothing to get ready for.");
      if (seat.ready) return { state: s, changed: false, ok: true };
      const next = { ...s, seats: s.seats.map((x) => (x.id === me ? { ...x, ready: true } : x)) };
      return done(maybeEarly(next, now));
    }

    case "pick": {
      if (s.phase !== "night") return refuse(s, "It's not after hours.");
      if (!seat?.alive) return refuse(s, "You're not on the team anymore.");
      if (!nightTargets(s, seat).includes(a.target)) return refuse(s, "You can't pick them.");
      if (a.offer) {
        if (seat.role !== "recruiter" || seat.offered) return refuse(s, "You don't have an offer to make.");
        if (!offerTargets(s).includes(a.target)) return refuse(s, "You can't make them an offer.");
        if (s.offer === a.target && s.picks[me] === a.target) return { state: s, changed: false, ok: true };
        return done(maybeEarly({ ...s, offer: a.target, picks: { ...s.picks, [me]: a.target } }, now));
      }
      // A plain pick from the Recruiter takes back any offer.
      const offer = seat.role === "recruiter" ? null : s.offer;
      if (s.picks[me] === a.target && offer === s.offer) return { state: s, changed: false, ok: true };
      return done(maybeEarly({ ...s, offer, picks: { ...s.picks, [me]: a.target } }, now));
    }

    case "vote": {
      if (s.phase !== "vote") return refuse(s, "Performance review hasn't started.");
      if (!seat?.alive) return refuse(s, "Only current employees can vote.");
      if (a.target !== SKIP && (!isAliveId(s, a.target) || a.target === me)) return refuse(s, "You can't vote for them.");
      if (s.votes[me] === a.target) return { state: s, changed: false, ok: true };
      return done(maybeEarly({ ...s, votes: { ...s.votes, [me]: a.target } }, now));
    }

    case "skip": {
      if (s.phase === "lobby" || s.phase === "over") return refuse(s, "Nothing to skip.");
      if (a.from && a.from !== s.phase) return { state: s, changed: false, ok: true }; // already moved on
      return done(endPhase({ ...s, pausedLeft: null }, now));
    }

    case "pause": {
      if (s.endsAt === null) return refuse(s, "Nothing to pause.");
      return done({ ...s, pausedLeft: Math.max(0, s.endsAt - now), endsAt: null });
    }

    case "resume": {
      if (s.pausedLeft === null) return refuse(s, "The game isn't paused.");
      return done({ ...s, endsAt: now + s.pausedLeft, pausedLeft: null });
    }

    case "end":
      return done({ ...initialState(s.settings), lineup: s.lineup ?? null });

    case "lineup": {
      // Anyone at the table may change the lineup between games (it's public), not just the host.
      if (s.phase !== "lobby" && s.phase !== "over") return refuse(s, "The lineup can only change between games.");
      if (a.reset) return s.lineup ? done({ ...s, lineup: null }) : { state: s, changed: false, ok: true };
      if (!a.from || !a.to) return refuse(s, "Pick a role to swap.");
      const r = swapRole(lineupFor(ctx.roomPlayerIds.length, s.settings, s.lineup ?? null), a.from, a.to);
      if (!r.ok) return refuse(s, r.error);
      return done({ ...s, lineup: r.lineup });
    }

    case "kick":
      // Removing a player is the route's job (it deletes their Player row); the game only checks it's allowed.
      if (me !== ctx.hostId) return refuse(s, "Only the host can do that.");
      if (s.phase !== "lobby" && s.phase !== "over") return refuse(s, "Players can only be removed between games.");
      if (a.playerId === me) return refuse(s, "You can't remove yourself.");
      return { state: s, changed: false, ok: true };

    case "moleChat": {
      if (!canMoleChat(s, me)) return refuse(s, "Only Moles still on the team can use this channel.");
      const cleaned = cleanChatBody(a.body);
      if (!cleaned.ok) return refuse(s, cleaned.error);
      const last = [...s.moleChat].reverse().find((m) => m.from === me);
      if (last && now - last.at < CHAT_MIN_INTERVAL_MS) return refuse(s, "Slow down a little.");
      const id = `${now.toString(36)}${ctx.rand(36 ** 4).toString(36)}`;
      const moleChat = [...s.moleChat, { id, from: me, body: cleaned.body, at: now }].slice(-MOLE_CHAT_MAX);
      return done({ ...s, moleChat });
    }
  }
}

/** A game is running: dealt and not over. */
function inGame(s: AllHandsState): boolean {
  return s.phase !== "lobby" && s.phase !== "over";
}

/** Living Moles may use the back channel at any point in a running game. */
export function canMoleChat(s: AllHandsState, playerId: string): boolean {
  const seat = seatOf(s, playerId);
  return inGame(s) && isMoleRole(seat?.role) && Boolean(seat?.alive);
}

/** Everyone may use the team chat, except the laid-off and fired while the game runs (no help from beyond). */
export function canTeamChat(s: AllHandsState, playerId: string): boolean {
  const seat = seatOf(s, playerId);
  return !inGame(s) || !seat || seat.alive;
}

export function isDue(s: AllHandsState, now: number): boolean {
  return s.endsAt !== null && now >= s.endsAt;
}

/** One step past an expired phase. A late request moves the game on by one phase, with a fresh clock. */
export function advanceState(s: AllHandsState, now: number): PartyResult<AllHandsState> {
  if (!isDue(s, now)) return { state: s, changed: false, ok: true };
  return done(endPhase(s, now));
}

export function parseAction(body: Record<string, unknown>): AllHandsAction | null {
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : null);
  switch (body.type) {
    case "skip":
      return { type: "skip", ...(typeof body.from === "string" ? { from: body.from as Phase } : {}) };
    case "start":
    case "ready":
    case "tick":
    case "pause":
    case "resume":
    case "end":
      return { type: body.type };
    case "settings":
      return body.settings && typeof body.settings === "object" ? { type: "settings", settings: body.settings as Partial<Settings> } : null;
    case "pick": {
      const target = str("target");
      return target ? { type: "pick", target, ...(body.offer === true ? { offer: true } : {}) } : null;
    }
    case "vote": {
      const target = str("target");
      return target ? { type: "vote", target } : null;
    }
    case "kick": {
      const playerId = str("playerId");
      return playerId ? { type: "kick", playerId } : null;
    }
    case "lineup": {
      if (body.reset === true) return { type: "lineup", reset: true };
      const from = str("from");
      const to = str("to");
      return from && to ? { type: "lineup", from: from as Role, to: to as Role } : null;
    }
    case "moleChat": {
      const body = str("body");
      return body !== null ? { type: "moleChat", body } : null;
    }
    default:
      return null;
  }
}

// ---------- views ----------

/** What one player may see. Roles appear only where this viewer is allowed to know them. */
export function viewFor(s: AllHandsState, viewerId: string, ctx: { hostId: string | null }): AllHandsView {
  const me = seatOf(s, viewerId);
  const over = s.phase === "over";
  const ghost = Boolean(me && !me.alive);
  const knowsAll = over || ghost;
  const departedRole = (x: Seat) => !x.alive && s.settings.revealOnFire;

  const roleFor = (x: Seat): Role | null => {
    if (knowsAll || x.id === viewerId) return x.role;
    if (isMoleRole(me?.role) && isMoleRole(x.role)) return x.role;
    if (x.spared) return x.role; // the Nephew outed himself by surviving
    if (departedRole(x)) return x.role;
    return null;
  };
  const seats: SeatView[] = s.seats.map((x) => ({ id: x.id, title: x.title, alive: x.alive, ready: x.ready, role: roleFor(x) }));

  let night: AllHandsView["night"] = null;
  if (s.phase === "night" && me?.alive) {
    const kind = nightKind(s, me);
    const alive = living(s);
    night = {
      kind,
      prompt: DECOY_PROMPTS[(s.round - 1 + DECOY_PROMPTS.length) % DECOY_PROMPTS.length],
      targets: nightTargets(s, me),
      myPick: s.picks[me.id] ?? null,
      team: kind === "mole" ? alive.filter((x) => isMoleRole(x.role)).map((x) => ({ id: x.id, pick: s.picks[x.id] ?? null })) : null,
      lastProtected: kind === "hr" ? s.lastProtected : null,
      offer: kind === "mole" ? s.offer : null,
      canOffer: me.role === "recruiter" && !me.offered,
      offerTargets: me.role === "recruiter" && !me.offered ? offerTargets(s) : [],
      acted: alive.filter((x) => s.picks[x.id]).length,
      total: alive.length,
    };
  }

  let vote: AllHandsView["vote"] = null;
  if (s.phase === "vote" || s.phase === "exit") {
    const tally: Record<string, string[]> = {};
    for (const [voter, target] of Object.entries(s.votes)) (tally[target] ??= []).push(voter);
    const alive = living(s);
    vote = {
      tally,
      myVote: s.votes[viewerId] ?? null,
      canVote: s.phase === "vote" && Boolean(me?.alive),
      voted: alive.filter((x) => s.votes[x.id]).length,
      total: alive.length,
    };
  }

  const exitSeat = s.exit?.fired ? seatOf(s, s.exit.fired) : undefined;
  return {
    phase: s.phase,
    round: s.round,
    endsAt: s.endsAt === null ? null : new Date(s.endsAt).toISOString(),
    paused: s.pausedLeft !== null,
    remainingMs: s.pausedLeft,
    settings: s.settings,
    hostId: ctx.hostId,
    seats,
    me: {
      seated: Boolean(me),
      alive: Boolean(me?.alive),
      role: me?.role ?? null,
      title: me?.title ?? null,
      ready: Boolean(me?.ready),
      mentor: me?.mentor ?? null,
      recruited: me?.recruitedRound !== undefined,
    },
    night,
    checks: me?.role === "it" || over ? s.checks : [],
    dawn:
      (s.phase === "dawn" || s.phase === "day") && s.dawn
        ? { ...s.dawn, recruited: me?.recruitedRound === s.dawn.round }
        : null,
    vote,
    exit: s.phase === "exit" && s.exit ? { ...s.exit, survived: Boolean(s.exit.survived), role: exitSeat ? roleFor(exitSeat) : null } : null,
    history: s.history.map((h) => {
      const x = h.playerId ? seatOf(s, h.playerId) : undefined;
      return { ...h, role: x ? roleFor(x) : null };
    }),
    winner: over ? s.winner : null,
    winners: over && s.winner ? s.seats.filter((x) => teamOf(s, x) === s.winner).map((x) => x.id) : [],
    nights: knowsAll ? s.nights : null,
    moleChat:
      knowsAll || isMoleRole(me?.role)
        ? s.moleChat.map((m) => ({ id: m.id, from: m.from, body: maskProfanity(m.body), at: new Date(m.at).toISOString() }))
        : null,
    canMoleChat: canMoleChat(s, viewerId),
    canTeamChat: canTeamChat(s, viewerId),
    minPlayers: MIN_PLAYERS,
    lineup: s.lineup ?? null,
  };
}

/** What a bot in a test room does now: tap Ready, make a night pick (Moles back each other up), or vote. */
export function botMove(s: AllHandsState, id: string, rand: (n: number) => number): AllHandsAction | null {
  const seat = seatOf(s, id);
  if (!seat) return null;
  const any = <T>(xs: T[]): T | null => (xs.length ? xs[rand(xs.length)] : null);
  if (s.phase === "reveal") return seat.ready ? null : { type: "ready" };
  if (!seat.alive) return null;
  if (s.phase === "night" && !s.picks[id]) {
    const targets = nightTargets(s, seat);
    const teammate = isMoleRole(seat.role) ? s.seats.find((x) => isMoleRole(x.role) && x.alive && s.picks[x.id]) : undefined;
    const target = teammate && targets.includes(s.picks[teammate.id]) ? s.picks[teammate.id] : any(targets);
    return target ? { type: "pick", target } : null;
  }
  if (s.phase === "vote" && !s.votes[id]) {
    const target = any([...living(s).filter((x) => x.id !== id).map((x) => x.id), SKIP]);
    return target ? { type: "vote", target } : null;
  }
  return null;
}

export const allHandsGame = definePartyGame<AllHandsState, Record<string, unknown>, AllHandsView>({
  id: ALL_HANDS_GAME_ID,
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
  canChat: canTeamChat,
  botMove: (s, id, rand) => botMove(s, id, rand) as Record<string, unknown> | null,
  roles: (s) => new Map(s.seats.map((x) => [x.id, x.role])),
});
