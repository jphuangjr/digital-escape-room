import "server-only";
import { CARDS } from "@/lib/grunt/cards";
import {
  DEFAULT_SETTINGS,
  EMOJI,
  GRUNT_GAME_ID,
  MAX_CLUE,
  MAX_GUESS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROUND_OPTIONS,
  TEAM_NAMES,
  TURN_OPTIONS_MS,
  guessMatches,
  type GruntAction,
  type GruntView,
  type Phase,
  type Settings,
  type TeamId,
  type TurnRecord,
} from "@/lib/grunt/types";
import { definePartyGame, type PartyCtx, type PartyResult } from "../party/registry";

/** The next clue-giver has this long to tap Start before their clock starts anyway. */
export const READY_MS = 30_000;
/** How long the turn's recap stays up before the next turn. */
export const RECAP_MS = 10_000;
/** One player can't bonk again for this long (no machine-gunning the button). */
export const BONK_COOLDOWN_MS = 4_000;
/** Typed guesses kept for a turn. */
const MAX_GUESSES = 40;

interface CardState {
  card: number;
  word1: boolean;
  phrase3: boolean;
  clue: number[];
}

/** The whole game. Stored in Room.scene; never sent to a client as is (the card is secret from the guessing team). */
export interface GruntState {
  v: 1;
  game: typeof GRUNT_GAME_ID;
  phase: Phase;
  endsAt: number | null;
  pausedLeft: number | null;
  settings: Settings;
  /** Each team's players, in turn order. */
  teams: [string[], string[]];
  scores: [number, number];
  /** Turn number, from 1; 0 before the first. */
  turn: number;
  totalTurns: number;
  /** Who gives clues next on each team (an index into that team). */
  nextGiver: [number, number];
  clueTeam: TeamId | null;
  giver: string | null;
  /** The card in play, and the turn's finished cards. */
  current: CardState | null;
  done: CardState[];
  guesses: { by: string; text: string; hit: "word" | "phrase" | null }[];
  bonks: number;
  /** When each player last bonked, so the button can cool down. */
  lastBonk: Record<string, number>;
  deck: number[];
  history: TurnRecord[];
  rng: number;
}

export function initialState(settings: Settings = DEFAULT_SETTINGS): GruntState {
  return {
    v: 1,
    game: GRUNT_GAME_ID,
    phase: "lobby",
    endsAt: null,
    pausedLeft: null,
    settings: { ...settings },
    teams: [[], []],
    scores: [0, 0],
    turn: 0,
    totalTurns: 0,
    nextGiver: [0, 0],
    clueTeam: null,
    giver: null,
    current: null,
    done: [],
    guesses: [],
    bonks: 0,
    lastBonk: {},
    deck: [],
    history: [],
    rng: 1,
  };
}

export function parseState(raw: unknown): GruntState {
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== 1 || (raw as { game?: unknown }).game !== GRUNT_GAME_ID) {
    return initialState();
  }
  const s = raw as Partial<GruntState>;
  const base = initialState(cleanSettings({ ...DEFAULT_SETTINGS, ...(s.settings ?? {}) }));
  return { ...base, ...s, settings: base.settings } as GruntState;
}

function cleanSettings(x: Partial<Settings>): Settings {
  return {
    turnMs: TURN_OPTIONS_MS.includes(Number(x.turnMs)) ? Number(x.turnMs) : DEFAULT_SETTINGS.turnMs,
    rounds: ROUND_OPTIONS.includes(Number(x.rounds)) ? Number(x.rounds) : DEFAULT_SETTINGS.rounds,
    bonk: x.bonk !== false,
  };
}

// ---------- helpers ----------

/** A small seeded generator (mulberry32) kept on the game, so a timer running out can still deal. */
function rand(s: GruntState, n: number): number {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
}

function shuffle<T>(s: GruntState, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(s, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clone = (s: GruntState): GruntState => structuredClone(s);

function refuse<S>(state: S, error: string): PartyResult<S> {
  return { state, changed: false, ok: false, error };
}
function done(state: GruntState): PartyResult<GruntState> {
  return { state, changed: true, ok: true };
}

const inGame = (s: GruntState) => s.phase !== "lobby" && s.phase !== "over";
export const teamOf = (s: GruntState, id: string): TeamId | null => (s.teams[0].includes(id) ? 0 : s.teams[1].includes(id) ? 1 : null);
const clueText = (c: CardState) => c.clue.map((i) => EMOJI[i] ?? "").join("");

function timed(s: GruntState, phase: Phase, ms: number | null, now: number): GruntState {
  s.phase = phase;
  s.endsAt = ms === null ? null : now + ms;
  s.pausedLeft = null;
  return s;
}

function drawCard(s: GruntState): CardState {
  if (!s.deck.length) s.deck = shuffle(s, CARDS.map((_, i) => i));
  return { card: s.deck.pop()!, word1: false, phrase3: false, clue: [] };
}

/** Points a card earned: 1 for the word, 3 for the phrase. */
const cardPoints = (c: CardState) => (c.word1 ? 1 : 0) + (c.phrase3 ? 3 : 0);

/** Put the card in play away (scored or not) and deal the next one. */
function nextCard(s: GruntState): void {
  if (s.current) s.done.push(s.current);
  s.current = drawCard(s);
}

/** Who's up next, or null when every turn is played. Teams alternate; each team's players take turns giving clues. */
function setUpTurn(s: GruntState, now: number): GruntState {
  if (s.turn >= s.totalTurns) return finish(s, now);
  s.turn += 1;
  const team: TeamId = s.turn % 2 === 1 ? 0 : 1;
  const players = s.teams[team];
  s.clueTeam = team;
  s.giver = players.length ? players[s.nextGiver[team] % players.length] : null;
  s.nextGiver[team] = (s.nextGiver[team] + 1) % Math.max(1, players.length);
  s.current = null;
  s.done = [];
  s.guesses = [];
  s.bonks = 0;
  s.lastBonk = {};
  if (!s.giver) return setUpTurn(s, now);
  return timed(s, "ready", READY_MS, now);
}

function beginClock(s: GruntState, now: number): GruntState {
  s.current = drawCard(s);
  return timed(s, "clue", s.settings.turnMs, now);
}

/** The clock ran out (or the host skipped): bank the turn and show the recap. */
function endTurn(s: GruntState, now: number): GruntState {
  const cards = [...s.done, ...(s.current ? [s.current] : [])];
  const points = cards.reduce((n, c) => n + cardPoints(c), 0) - s.bonks;
  if (s.clueTeam !== null) {
    s.scores[s.clueTeam] += points;
    s.history.push({
      team: s.clueTeam,
      giver: s.giver ?? "",
      bonks: s.bonks,
      points,
      cards: cards
        .filter((c) => c.word1 || c.phrase3 || c.clue.length)
        .map((c) => ({ word: CARDS[c.card].word, phrase: CARDS[c.card].phrase, word1: c.word1, phrase3: c.phrase3, clue: clueText(c) })),
    });
  }
  s.done = cards;
  s.current = null;
  return timed(s, "recap", RECAP_MS, now);
}

function finish(s: GruntState, now: number): GruntState {
  s.clueTeam = null;
  s.giver = null;
  s.current = null;
  return timed(s, "over", null, now);
}

export function winnerOf(s: GruntState): TeamId | null {
  if (s.scores[0] === s.scores[1]) return null;
  return s.scores[0] > s.scores[1] ? 0 : 1;
}

/** Score the card in play. Getting the phrase also counts the word (it's on the same card), then a new card comes up. */
function score(s: GruntState, what: "word" | "phrase"): void {
  const c = s.current;
  if (!c) return;
  if (what === "phrase") {
    c.word1 = true;
    c.phrase3 = true;
    nextCard(s);
  } else {
    c.word1 = true;
  }
}

// ---------- actions ----------

const HOST_ONLY = new Set<GruntAction["type"]>(["start", "settings", "pause", "resume", "end", "kick", "skip"]);
const GIVER_ONLY = new Set<GruntAction["type"]>(["emoji", "undo", "clear", "got", "next", "pass"]);

export function applyAction(s0: GruntState, a: GruntAction, ctx: PartyCtx): PartyResult<GruntState> {
  const { playerId: me, now } = ctx;
  if (HOST_ONLY.has(a.type) && me !== ctx.hostId) return refuse(s0, "Only the host can do that.");
  if (GIVER_ONLY.has(a.type)) {
    if (s0.phase !== "clue" || !s0.current) return refuse(s0, "The clock isn't running.");
    if (me !== s0.giver) return refuse(s0, "Only this turn's clue-giver can do that.");
  }
  const s = clone(s0);
  const c = s.current;

  switch (a.type) {
    case "tick":
      return advanceState(s0, now);

    case "start": {
      if (inGame(s)) return refuse(s0, "The game is already running.");
      const ids = ctx.roomPlayerIds.slice(0, MAX_PLAYERS);
      if (ids.length < MIN_PLAYERS) return refuse(s0, `You need at least ${MIN_PLAYERS} players to start.`);
      const fresh = initialState(s.settings);
      fresh.rng = ctx.rand(2 ** 31) | 0;
      // Random, balanced teams: deal the shuffled table out like cards.
      shuffle(fresh, ids).forEach((id, i) => fresh.teams[(i % 2) as TeamId].push(id));
      fresh.totalTurns = 2 * Math.max(fresh.teams[0].length, fresh.teams[1].length) * fresh.settings.rounds;
      return done(setUpTurn(fresh, now));
    }

    case "settings": {
      if (inGame(s)) return refuse(s0, "Settings can only change between games.");
      s.settings = cleanSettings({ ...s.settings, ...a.settings });
      return done(s);
    }

    case "join": {
      // Arrived mid-game: join the smaller team. Your first clue turn comes when your team's rotation reaches you.
      if (!inGame(s)) return refuse(s0, "Wait for the host to start.");
      if (teamOf(s, me) !== null) return { state: s0, changed: false, ok: true };
      if (s.teams[0].length + s.teams[1].length >= MAX_PLAYERS) return refuse(s0, "This game is full.");
      s.teams[s.teams[0].length <= s.teams[1].length ? 0 : 1].push(me);
      return done(s);
    }

    case "begin": {
      if (s.phase !== "ready") return refuse(s0, "It's not time to start a turn.");
      if (me !== s.giver && me !== ctx.hostId) return refuse(s0, "The clue-giver starts their own turn.");
      return done(beginClock(s, now));
    }

    case "emoji": {
      if (!Number.isInteger(a.emoji) || a.emoji < 0 || a.emoji >= EMOJI.length) return refuse(s0, "That's not on the keyboard.");
      if (c!.clue.length >= MAX_CLUE) return refuse(s0, `That's ${MAX_CLUE} emoji. Clear it and try another way in.`);
      c!.clue.push(a.emoji);
      return done(s);
    }

    case "undo":
      if (!c!.clue.length) return { state: s0, changed: false, ok: true };
      c!.clue.pop();
      return done(s);

    case "clear":
      if (!c!.clue.length) return { state: s0, changed: false, ok: true };
      c!.clue = [];
      return done(s);

    case "got":
      if (a.points === 1 && c!.word1) return refuse(s0, "The word's already counted. Go for the phrase, or move on.");
      score(s, a.points === 3 ? "phrase" : "word");
      return done(s);

    case "next":
      if (!c!.word1) return refuse(s0, "They haven't got the word yet. Pass if you want a new card.");
      nextCard(s);
      return done(s);

    case "pass":
      nextCard(s);
      return done(s);

    case "guess": {
      // Typed guesses, for anyone on the clue team but the clue-giver. Right ones score by themselves.
      if (s.phase !== "clue" || !c) return refuse(s0, "Wait for the clock to start.");
      if (teamOf(s, me) !== s.clueTeam || me === s.giver) return refuse(s0, "Only the clue-giver's team guesses.");
      const text = a.text.replace(/\s+/g, " ").trim().slice(0, MAX_GUESS);
      if (!text) return refuse(s0, "Type a guess first.");
      const card = CARDS[c.card];
      const hit: "word" | "phrase" | null = guessMatches(text, card.phrase) ? "phrase" : !c.word1 && guessMatches(text, card.word) ? "word" : null;
      s.guesses = [...s.guesses, { by: me, text, hit }].slice(-MAX_GUESSES);
      if (hit) score(s, hit);
      return done(s);
    }

    case "bonk": {
      // The other team caught the clue-giver talking or pointing: a point off this turn.
      if (!s.settings.bonk) return refuse(s0, "Bonks are off in this game.");
      if (s.phase !== "clue") return refuse(s0, "Nothing to bonk right now.");
      const t = teamOf(s, me);
      if (t === null || t === s.clueTeam) return refuse(s0, "Only the other team can bonk.");
      if (me in s.lastBonk && now - s.lastBonk[me] < BONK_COOLDOWN_MS) return refuse(s0, "Easy. One bonk at a time.");
      s.lastBonk[me] = now;
      s.bonks += 1;
      return done(s);
    }

    case "skip": {
      // The host moves things on: start the waiting turn, end the running one, or go to the next turn.
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
      if (inGame(s)) return refuse(s0, "Players can only be removed between games.");
      if (a.playerId === me) return refuse(s0, "You can't remove yourself.");
      return { state: s0, changed: false, ok: true };
  }
}

function endPhase(s: GruntState, now: number): GruntState {
  switch (s.phase) {
    case "ready":
      return beginClock(s, now);
    case "clue":
      return endTurn(s, now);
    case "recap":
      return setUpTurn(s, now);
    default:
      return s;
  }
}

export function isDue(s: GruntState, now: number): boolean {
  return s.endsAt !== null && now >= s.endsAt;
}

export function advanceState(s: GruntState, now: number): PartyResult<GruntState> {
  if (!isDue(s, now)) return { state: s, changed: false, ok: true };
  return done(endPhase(clone(s), now));
}

export function parseAction(body: Record<string, unknown>): GruntAction | null {
  switch (body.type) {
    case "start":
    case "begin":
    case "undo":
    case "clear":
    case "next":
    case "pass":
    case "bonk":
    case "join":
    case "tick":
    case "skip":
    case "pause":
    case "resume":
    case "end":
      return { type: body.type };
    case "settings":
      return body.settings && typeof body.settings === "object" ? { type: "settings", settings: body.settings as Partial<Settings> } : null;
    case "emoji":
      return typeof body.emoji === "number" && Number.isInteger(body.emoji) ? { type: "emoji", emoji: body.emoji } : null;
    case "got":
      return body.points === 1 || body.points === 3 ? { type: "got", points: body.points } : null;
    case "guess":
      return typeof body.text === "string" ? { type: "guess", text: body.text } : null;
    case "kick":
      return typeof body.playerId === "string" ? { type: "kick", playerId: body.playerId } : null;
    default:
      return null;
  }
}

// ---------- views ----------

export function viewFor(s: GruntState, viewerId: string, ctx: { hostId: string | null; now?: number }): GruntView {
  const myTeam = teamOf(s, viewerId);
  const isGiver = viewerId === s.giver && inGame(s);
  // The guessing team never sees the card while it's in play: the clue-giver and the other team (who police it) do.
  const seesCard = isGiver || (myTeam !== null && s.clueTeam !== null && myTeam !== s.clueTeam);
  const c = s.current;
  const now = ctx.now ?? Date.now();
  const last = s.phase === "recap" || s.phase === "over" ? (s.history.at(-1) ?? null) : null;
  return {
    game: GRUNT_GAME_ID,
    phase: s.phase,
    turn: s.turn,
    totalTurns: s.totalTurns,
    endsAt: s.endsAt === null ? null : new Date(s.endsAt).toISOString(),
    paused: s.pausedLeft !== null,
    remainingMs: s.pausedLeft,
    hostId: ctx.hostId,
    settings: s.settings,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    teams: ([0, 1] as TeamId[]).map((id) => ({ id, players: s.teams[id], score: s.scores[id] })),
    clueTeam: inGame(s) ? s.clueTeam : null,
    giverId: inGame(s) ? s.giver : null,
    me: {
      team: myTeam,
      isGiver,
      canBonk:
        s.settings.bonk &&
        s.phase === "clue" &&
        myTeam !== null &&
        myTeam !== s.clueTeam &&
        !(viewerId in s.lastBonk && now - s.lastBonk[viewerId] < BONK_COOLDOWN_MS),
    },
    card: c && seesCard && s.phase === "clue" ? { word: CARDS[c.card].word, phrase: CARDS[c.card].phrase, word1: c.word1 } : null,
    clue: c && s.phase === "clue" ? c.clue.map((i) => EMOJI[i] ?? "") : [],
    guesses: s.phase === "clue" ? s.guesses : [],
    turnPoints: [...s.done, ...(c ? [c] : [])].reduce((n, x) => n + cardPoints(x), 0) - s.bonks,
    turnBonks: s.bonks,
    lastTurn: last,
    history: s.history,
    winner: s.phase === "over" ? winnerOf(s) : null,
  };
}

/** Test rooms: a bot clue-giver starts its turn, taps a few emoji, then passes. Nobody else moves for a bot. */
export function botMove(s: GruntState, id: string, r: (n: number) => number): GruntAction | null {
  if (s.giver !== id) return null;
  if (s.phase === "ready") return { type: "begin" };
  if (s.phase === "clue" && s.current) return s.current.clue.length < 4 ? { type: "emoji", emoji: r(EMOJI.length) } : { type: "pass" };
  return null;
}

export const gruntGame = definePartyGame<GruntState, Record<string, unknown>, GruntView>({
  id: GRUNT_GAME_ID,
  maxPlayers: MAX_PLAYERS,
  parse: parseState,
  isAction: (body) => parseAction(body) !== null,
  apply: (state, body, ctx) => {
    const action = parseAction(body);
    return action ? applyAction(state, action, ctx) : refuse(state, "Unknown action.");
  },
  due: isDue,
  advance: advanceState,
  view: (s, viewer, ctx) => viewFor(s, viewer, ctx),
  isOver: (s) => s.phase === "over",
  botMove: (s, id, r) => botMove(s, id, r) as Record<string, unknown> | null,
  roles: (s) => new Map([...s.teams[0].map((id) => [id, `Team ${TEAM_NAMES[0]}`] as const), ...s.teams[1].map((id) => [id, `Team ${TEAM_NAMES[1]}`] as const)]),
});
