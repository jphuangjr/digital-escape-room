// Reply All: a prompt-and-reply party game at Synergr. Each round someone starts a thread with a prompt, everyone
// answers with one reply card from their hand, and the funniest reply gets pinned (a point). First to the target wins.
// Client-safe shapes only: the game state with everyone's hand lives in src/server/replyall and each player gets a
// ReplyAllView built for them alone.

export const REPLY_ALL_GAME_ID = "reply-all";

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const HAND_SIZE = 7;

export type Phase =
  | "lobby" // waiting for the host to start
  | "pick" // everyone (but the Manager) chooses a reply from their hand
  | "judge" // the Manager reads the replies out loud and pins one
  | "vote" // vote mode: everyone reacts to their favourite reply (not their own)
  | "result" // the pinned reply, and who wrote it
  | "over";

/** "manager": a rotating Manager judges each round. "vote": everyone plays and the table votes. */
export type Mode = "manager" | "vote";

export interface Settings {
  mode: Mode;
  /** Points ("pins") to win. */
  target: number;
  /** How long players have to reply, and the Manager (or the table) to pick. */
  pickMs: number;
}

export const DEFAULT_SETTINGS: Settings = { mode: "manager", target: 5, pickMs: 90_000 };
export const TARGET_OPTIONS = [3, 5, 7];
export const PICK_OPTIONS_MS = [60_000, 90_000, 120_000];

export type ReplyAllAction =
  | { type: "start" }
  | { type: "settings"; settings: Partial<Settings> }
  | { type: "play"; card: number }
  | { type: "choose"; entry: number }
  | { type: "vote"; entry: number }
  | { type: "mulligan" }
  | { type: "join" }
  | { type: "tick" }
  | { type: "skip" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "end" }
  | { type: "kick"; playerId: string };

export interface SeatView {
  id: string;
  score: number;
  /** This round: has replied (or, in vote mode, has voted). Never says what. */
  done: boolean;
  isManager: boolean;
}

export interface CardView {
  /** The card's index in REPLIES, which is what `play` takes. */
  card: number;
  text: string;
}

/** A reply on the table. Anonymous until the result: `by` and `votes` are filled in only then. */
export interface EntryView {
  entry: number;
  text: string;
  /** Played by the timer because its writer ran out of time. Shown only at the result. */
  auto?: boolean;
  by?: string;
  votes?: number;
  mine?: boolean;
}

export interface RoundRecord {
  round: number;
  prompt: string;
  reply: string;
  /** Who got the pin. Several in vote mode on a tie. */
  winners: string[];
}

export interface ReplyAllView {
  game: typeof REPLY_ALL_GAME_ID;
  phase: Phase;
  round: number;
  /** ISO time the current phase ends; null in the lobby, at the end, or while paused. */
  endsAt: string | null;
  paused: boolean;
  remainingMs: number | null;
  hostId: string | null;
  settings: Settings;
  minPlayers: number;
  maxPlayers: number;
  seats: SeatView[];
  managerId: string | null;
  prompt: string | null;
  me: {
    seated: boolean;
    isManager: boolean;
    hand: CardView[];
    /** The card I played this round. */
    played: number | null;
    /** That card's text. */
    playedText: string | null;
    mulliganLeft: boolean;
    /** Vote mode: the entry I voted for. */
    voted: number | null;
  };
  /** The replies, once everyone has played. In judge/vote they're anonymous and in shuffled order. */
  entries: EntryView[] | null;
  result: { winners: string[]; entry: number; byPicker: "manager" | "vote" | "timer" } | null;
  history: RoundRecord[];
  /** At the end: whoever reached the target. */
  champions: string[];
}

/** The prompt with a reply in it, as parts so the reply can be styled. A prompt without a blank is a question. */
export function fillParts(prompt: string, reply: string): { before: string; reply: string; after: string; question: boolean } {
  const i = prompt.indexOf("____");
  if (i < 0) return { before: prompt + " ", reply: capitalize(reply), after: "", question: true };
  const before = prompt.slice(0, i);
  const startOfSentence = /^\s*["“]?\s*$/.test(before) || /[.!?:]\s*["“]?\s*$/.test(before);
  const text = startOfSentence ? capitalize(reply) : reply;
  let after = prompt.slice(i + 4);
  // A reply that ends a sentence itself ("surprise! It's a pivot") doesn't need the prompt's full stop too.
  if (/[.!?]$/.test(text) && /^\./.test(after)) after = after.slice(1);
  return { before, reply: text, after, question: false };
}

export function fillText(prompt: string, reply: string): string {
  const p = fillParts(prompt, reply);
  return `${p.before}${p.reply}${p.after}`;
}

/** "a calendar invite" → "A calendar invite": a card in the hand, or the start of a sentence. */
export function capitalize(s: string): string {
  const i = s.search(/[A-Za-z]/);
  return i < 0 ? s : s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
}
