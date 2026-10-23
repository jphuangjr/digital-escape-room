import "server-only";
import type { HintTier } from "@/lib/scene/types";
import { JAM_AFTER, JAM_SEC } from "@/lib/rules";

// Rules every physical-room game shares: the case log, jamming locks, tiered hints and the room vote.
// Pure functions over plain data, so each game's applyAction stays unit-testable.

/** Who acted. */
export type Who = { id: string; name: string };
/** Who's in the room right now (a vote closes once every online player has voted). */
export type RoomCtx = { hostId: string | null; onlineIds: string[] };

// ---------- Case log ----------

/** Log entries keep at most this many lines. */
export const MAX_LOG = 100;

export interface StoredLogBase {
  id: string;
  at: string;
  playerId: string;
  playerName: string;
}

/** `log` with a new entry by `who` appended, trimmed to the newest MAX_LOG. */
export function appendLog<E extends StoredLogBase>(log: E[], who: Who, now: Date, fields: Omit<E, keyof StoredLogBase>): E[] {
  const entry = { id: `${now.getTime().toString(36)}-${log.length}`, at: now.toISOString(), playerId: who.id, playerName: who.name, ...fields } as E;
  return [...log, entry].slice(-MAX_LOG);
}

// ---------- Jamming locks ----------

// Wrong guesses in a row before a lock jams, and for how long (shared with the client's countdowns).
export { JAM_AFTER, JAM_SEC };

export interface Jam {
  wrong: number;
  until: string | null;
}
export type Jams<L extends string> = Partial<Record<L, Jam>>;

/** When a jammed lock frees up, or null if it isn't jammed now. */
export function jammedUntil<L extends string>(jams: Jams<L> | undefined, lock: L, now: Date): string | null {
  const until = jams?.[lock]?.until;
  return until && new Date(until) > now ? until : null;
}

/**
 * What a lock's DTO may show about its jam: when it frees up, or (once someone has guessed wrong) how many more
 * wrong guesses it takes. Counts only, never the answer.
 */
export function lockState<L extends string>(jams: Jams<L> | undefined, lock: L, now: Date): { jammedUntil?: string; left?: number } {
  const until = jammedUntil(jams, lock, now);
  if (until) return { jammedUntil: until };
  const wrong = jams?.[lock]?.wrong ?? 0;
  return wrong > 0 ? { left: Math.max(1, JAM_AFTER - wrong) } : {};
}

/** Record a guess: a right one clears the count; three wrong in a row jam the lock for JAM_SEC. */
export function recordGuess<L extends string>(jams: Jams<L> | undefined, lock: L, correct: boolean, now: Date): { jams: Jams<L>; jammedNow: boolean } {
  if (correct) return { jams: { ...jams, [lock]: { wrong: 0, until: null } }, jammedNow: false };
  const wrong = (jams?.[lock]?.wrong ?? 0) + 1;
  const jammedNow = wrong >= JAM_AFTER;
  const until = jammedNow ? new Date(now.getTime() + JAM_SEC * 1000).toISOString() : null;
  return { jams: { ...jams, [lock]: { wrong: jammedNow ? 0 : wrong, until } }, jammedNow };
}

export function parseJams<L extends string>(raw: unknown, locks: readonly L[]): Jams<L> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, Partial<Jam> | undefined>;
  return Object.fromEntries(
    locks.flatMap((l) => {
      const j = r[l];
      return j && typeof j.wrong === "number" ? [[l, { wrong: j.wrong, until: typeof j.until === "string" ? j.until : null }]] : [];
    }),
  ) as Jams<L>;
}

// ---------- Hints ----------

export interface StoredHint {
  id: string;
  puzzle: string;
  tier: HintTier;
  at: string;
}

/** The next tier for `puzzle` and when it's ready (null = now), or null once all three are out. */
export function nextHintTier(hints: StoredHint[], puzzle: string, cooldownSec: number, now: Date): { tier: HintTier; readyAt: string | null } | null {
  const given = hints.filter((h) => h.puzzle === puzzle);
  if (given.length >= 3) return null;
  const last = given.at(-1);
  const ready = last ? new Date(new Date(last.at).getTime() + cooldownSec * 1000) : null;
  return { tier: (given.length + 1) as HintTier, readyAt: ready && ready > now ? ready.toISOString() : null };
}

export function addHint(hints: StoredHint[], puzzle: string, tier: HintTier, now: Date): StoredHint[] {
  return [...hints, { id: `${now.getTime().toString(36)}-${hints.length}`, puzzle, tier, at: now.toISOString() }];
}

export function parseHints(raw: unknown): StoredHint[] {
  return Array.isArray(raw)
    ? raw.filter((h): h is StoredHint => !!h && typeof h.puzzle === "string" && typeof h.at === "string" && [1, 2, 3].includes(h.tier))
    : [];
}

// ---------- The room vote ----------

export interface StoredVote<C extends string> {
  votes: Record<string, C>;
  tie: C[] | null;
}

export function tally<C extends string>(choices: readonly C[], votes: Record<string, C>): Record<C, number> {
  const counts = Object.fromEntries(choices.map((c) => [c, 0])) as Record<C, number>;
  for (const v of Object.values(votes)) if (v in counts) counts[v] += 1;
  return counts;
}

export function parseVote<C extends string>(raw: unknown, isChoice: (v: unknown) => v is C): StoredVote<C> | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Partial<StoredVote<string>>;
  return {
    votes: Object.fromEntries(Object.entries(v.votes ?? {}).filter(([, c]) => isChoice(c))) as Record<string, C>,
    tie: Array.isArray(v.tie) ? v.tie.filter(isChoice) : null,
  };
}

export type VoteMove = { type: "vote"; choice: unknown } | { type: "close" } | { type: "tiebreak"; choice: unknown };

/** What a vote move did. `winner` means the game should end with that choice. */
export type VoteStep<C extends string> =
  | { kind: "refused"; reason: "noVote" | "badChoice" | "noVotes" | "hostOnlyClose" | "noTie" | "hostOnlyTie" | "pickTied" }
  | { kind: "recorded"; vote: StoredVote<C> }
  | { kind: "tie"; vote: StoredVote<C> }
  | { kind: "winner"; vote: StoredVote<C>; choice: C; counts: Record<C, number> };

/**
 * One move in the room vote. Votes can change until it closes; it closes once everyone online has voted, or
 * when the host closes it. A clear majority wins; a tie goes to the host.
 */
export function stepVote<C extends string>(
  vote: StoredVote<C> | null,
  move: VoteMove,
  who: Who,
  room: RoomCtx,
  choices: readonly C[],
): VoteStep<C> {
  const isChoice = (v: unknown): v is C => typeof v === "string" && (choices as readonly string[]).includes(v);
  const close = (v: StoredVote<C>): VoteStep<C> => {
    const counts = tally(choices, v.votes);
    const top = Math.max(...Object.values<number>(counts));
    if (top === 0) return { kind: "refused", reason: "noVotes" };
    const leaders = choices.filter((c) => counts[c] === top);
    if (leaders.length > 1) return { kind: "tie", vote: { ...v, tie: leaders } };
    return { kind: "winner", vote: v, choice: leaders[0], counts };
  };
  const isHost = !room.hostId || who.id === room.hostId;
  switch (move.type) {
    case "vote": {
      if (!vote) return { kind: "refused", reason: "noVote" };
      if (!isChoice(move.choice)) return { kind: "refused", reason: "badChoice" };
      const next: StoredVote<C> = { votes: { ...vote.votes, [who.id]: move.choice }, tie: null };
      const everyone = room.onlineIds.length > 0 && room.onlineIds.every((id) => next.votes[id]);
      return everyone ? close(next) : { kind: "recorded", vote: next };
    }
    case "close":
      if (!vote) return { kind: "refused", reason: "noVote" };
      if (!isHost) return { kind: "refused", reason: "hostOnlyClose" };
      return close(vote);
    case "tiebreak":
      if (!vote?.tie) return { kind: "refused", reason: "noTie" };
      if (!isHost) return { kind: "refused", reason: "hostOnlyTie" };
      if (!isChoice(move.choice) || !vote.tie.includes(move.choice)) return { kind: "refused", reason: "pickTied" };
      return { kind: "winner", vote, choice: move.choice, counts: tally(choices, vote.votes) };
  }
}
