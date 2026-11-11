// Grunt: an emoji-only clue game for two teams. Each turn one player gets a card (a word for 1 point, a harder phrase
// for 3) and may only "speak" by tapping emoji, which appear on every phone as they go. Their team shouts guesses (or
// types them); the other team sees the card and bonks the clue-giver for talking or pointing. Client-safe shapes only:
// the game state lives in src/server/grunt and each player gets a GruntView built for them.

export const GRUNT_GAME_ID = "grunt";

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;
/** The longest clue a turn's card can have, in emoji. */
export const MAX_CLUE = 30;
/** A guess, at most this many characters. */
export const MAX_GUESS = 40;

export type TeamId = 0 | 1;
export const TEAM_NAMES: Record<TeamId, string> = { 0: "Rocks", 1: "Sticks" };
export const TEAM_ICONS: Record<TeamId, string> = { 0: "🪨", 1: "🪵" };

export type Phase =
  | "lobby" // waiting for the host to start
  | "ready" // the next clue-giver is up; they tap Start when their team is ready
  | "clue" // the clock is running: emoji clues, guesses, bonks
  | "recap" // the turn's cards and points, then the next turn
  | "over";

export interface Settings {
  /** How long a turn's clock runs. */
  turnMs: number;
  /** How many times each player gives clues. */
  rounds: number;
  /** The other team may bonk the clue-giver for talking or pointing (a point off). */
  bonk: boolean;
}

export const DEFAULT_SETTINGS: Settings = { turnMs: 60_000, rounds: 1, bonk: true };
export const TURN_OPTIONS_MS = [45_000, 60_000, 90_000];
export const ROUND_OPTIONS = [1, 2, 3];

export type GruntAction =
  | { type: "start" }
  | { type: "settings"; settings: Partial<Settings> }
  | { type: "begin" } // the clue-giver starts their clock
  | { type: "emoji"; emoji: number }
  | { type: "undo" }
  | { type: "clear" }
  | { type: "got"; points: 1 | 3 } // the clue-giver heard it said out loud
  | { type: "next" } // move on after the word, without trying the phrase
  | { type: "pass" }
  | { type: "guess"; text: string }
  | { type: "bonk" }
  | { type: "join" }
  | { type: "tick" }
  | { type: "skip" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "end" }
  | { type: "kick"; playerId: string };

/** One card as it went in a turn. */
export interface CardResult {
  word: string;
  phrase: string;
  /** The 1-point word was guessed. */
  word1: boolean;
  /** The 3-point phrase was guessed. */
  phrase3: boolean;
  /** The emoji clue, as text. */
  clue: string;
}

export interface TurnRecord {
  team: TeamId;
  giver: string;
  cards: CardResult[];
  bonks: number;
  points: number;
}

export interface GuessView {
  by: string;
  text: string;
  /** "word" or "phrase" when it was right, null when it wasn't. */
  hit: "word" | "phrase" | null;
}

export interface GruntView {
  game: typeof GRUNT_GAME_ID;
  phase: Phase;
  /** Turn number, from 1. */
  turn: number;
  totalTurns: number;
  endsAt: string | null;
  paused: boolean;
  remainingMs: number | null;
  hostId: string | null;
  settings: Settings;
  minPlayers: number;
  maxPlayers: number;
  /** Each team's players in seat order, and score. */
  teams: { id: TeamId; players: string[]; score: number }[];
  /** The team giving clues this turn, and who. */
  clueTeam: TeamId | null;
  giverId: string | null;
  me: {
    team: TeamId | null;
    isGiver: boolean;
    /** May bonk right now (on the other team, bonks on, clock running, not cooling down). */
    canBonk: boolean;
  };
  /**
   * This turn's card. Seen by the clue-giver and the other team (who police it), never by the guessing team until
   * the recap.
   */
  card: { word: string; phrase: string; word1: boolean } | null;
  /** The clue so far, as emoji. Everyone sees it. */
  clue: string[];
  /** This turn's typed guesses, newest last. */
  guesses: GuessView[];
  /** This turn so far: points and bonks. */
  turnPoints: number;
  turnBonks: number;
  /** The turn that just ended (recap), or null. */
  lastTurn: TurnRecord | null;
  history: TurnRecord[];
  /** At the end: the winning team (null on a tie). */
  winner: TeamId | null;
}

/**
 * The emoji keyboard. No letters, numbers or anything that spells (🆗, 🔤, keycaps, flags), so a clue can't sneak in
 * words. Indices are what the `emoji` action takes, so only append to the end of a group's list.
 */
export const EMOJI_GROUPS: { label: string; emoji: string[] }[] = [
  {
    label: "People",
    emoji: ["🙂", "😂", "😢", "😡", "😱", "😴", "🤔", "😍", "🤢", "🥶", "🥵", "🤫", "👶", "🧒", "🧑", "🧓", "👮", "👨‍🍳", "🧑‍⚕️", "🧑‍🚀", "🧙", "🧛", "🧟", "🤴", "👸", "🦸", "💃", "🏃", "🧍", "🛌", "🙏", "👍", "👎", "👏", "💪", "👀", "👂", "👃", "👄", "🦷", "🦴", "🧠", "❤️", "💔"],
  },
  {
    label: "Animals",
    emoji: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦉", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🕷️", "🐢", "🐍", "🦖", "🐙", "🦀", "🐟", "🐬", "🐳", "🦈", "🐘", "🦒", "🐪", "🐑"],
  },
  {
    label: "Food",
    emoji: ["🍎", "🍌", "🍇", "🍓", "🍋", "🍉", "🍒", "🍑", "🍍", "🥥", "🥕", "🌽", "🌶️", "🥔", "🍄", "🥜", "🍞", "🧀", "🥚", "🥓", "🍔", "🍟", "🍕", "🌭", "🌮", "🍝", "🍜", "🍣", "🍿", "🍩", "🍪", "🎂", "🍰", "🍫", "🍬", "🍦", "☕", "🍵", "🍺", "🍷", "🥛", "🧂"],
  },
  {
    label: "Things",
    emoji: ["📱", "💻", "📺", "📷", "🎮", "🎧", "🎸", "🥁", "🎺", "🔔", "💡", "🔦", "🕯️", "🔑", "🔒", "🔨", "🪓", "🔧", "🪚", "⚙️", "🧲", "💣", "🔫", "🗡️", "🛡️", "🏹", "💊", "💉", "🩹", "🧻", "🧼", "🪥", "🛁", "🚽", "🛏️", "🪑", "🚪", "🪞", "🧸", "🎈", "🎁", "🎀", "👑", "💍", "💎", "💰", "💸", "👓", "👕", "👖", "👗", "👟", "👠", "🎩", "🧢", "🎒", "☂️", "✂️", "📦", "✉️", "📖", "✏️", "🗑️", "⏰", "⌛", "📅", "🏆", "⚽", "🏀", "🎾", "⚾", "🎳", "🎲", "🧩", "🃏", "🎯", "🪁", "🛹", "🎣", "🧵"],
  },
  {
    label: "Places",
    emoji: ["🏠", "🏰", "⛪", "🏥", "🏫", "🏦", "🏭", "⛺", "🏝️", "🏔️", "🌋", "🏜️", "🌊", "🌲", "🌴", "🌵", "🌸", "🌻", "🍀", "🍁", "🌍", "🌙", "☀️", "⭐", "☁️", "🌧️", "⛈️", "❄️", "🌈", "🌪️", "🔥", "💧", "🚗", "🚕", "🚌", "🚓", "🚑", "🚒", "🚲", "🏍️", "🚂", "✈️", "🚀", "🛸", "🚢", "⛵", "🚁", "🎢", "🎡", "🎪", "🗽", "🗼", "🌉", "🛣️"],
  },
  {
    label: "Signs",
    emoji: ["➕", "➖", "✖️", "❓", "❗", "✅", "❌", "⬆️", "⬇️", "⬅️", "➡️", "↩️", "🔄", "🔁", "⏩", "⏪", "⏸️", "🔊", "🔇", "💥", "💤", "💨", "💦", "✨", "🎵", "💬", "💭", "🚫", "⚠️", "♻️", "🔴", "🟢", "🔵", "🟡", "⚫", "⚪", "🔺", "🔻", "⬛", "⬜", "🌀"],
  },
];

/** Every emoji on the keyboard, in one list; the `emoji` action's index is into this. */
export const EMOJI: string[] = EMOJI_GROUPS.flatMap((g) => g.emoji);

/**
 * A guess and a card's answer compared loosely: case, accents, punctuation, spacing, "a/an/the" and a plural "s" don't
 * matter. "The Hot-Dogs!" matches "hot dog".
 */
export function normalizeGuess(text: string): string {
  const words = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !["a", "an", "the"].includes(w))
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  return words.join("");
}

export function guessMatches(guess: string, answer: string): boolean {
  const g = normalizeGuess(guess);
  return g.length > 0 && g === normalizeGuess(answer);
}
