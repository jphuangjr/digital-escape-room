// A finished room's result: what the end-of-game reveal shows the team, and (minus the per-player
// credits) what a shared result card shows anyone. Nothing here may contain an answer.

/** One player's part in the case, from the attempts log and the scene's case log. */
export interface ResultCredit {
  playerId: string;
  name: string;
  color: string;
  /** Locks opened (scene games) or puzzles solved (Ada): correct answers this player entered. */
  solved: number;
  /** Items this player picked up (scene games only). */
  found: number;
  /** Names of the key items (evidence, seals, secrets) this player found, in the viewer's language. */
  keyItems: string[];
}

export interface RoomResult {
  gameId: string;
  ending: string | null;
  solved: boolean;
  durationMs: number;
  hintsUsed: number;
  attempts: number;
  wrongAttempts: number;
  playerCount: number;
  /** Place on the game's leaderboard (1 = best), when the room has an entry. */
  rank: number | null;
  boardSize: number;
  /** An admin's test run: kept off the public leaderboard, so it has no rank and no share card. */
  testRun: boolean;
  /** Achievement ids (see src/lib/achievements.ts) this run earned for the team. */
  badges: string[];
  /** The leaderboard entry id behind the public /s/<id> result card, or null if there is none. */
  shareId: string | null;
  credits: ResultCredit[];
}

/** Room badges (CaseRecord.badges) and the profile achievement each one stands for. */
const ROOM_BADGE_ACHIEVEMENT: Record<string, string> = {
  compass: "ada-compass",
  envelope: "ada-envelope",
  everyclue: "nx-every-clue",
  "atlas-secrets": "atlas-secrets",
  "atlas-reroute": "atlas-reroute",
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * The achievements a single run earns the whole team, by the same rules as src/server/profile.ts
 * (minus the ones that depend on a player's history or role, like "five cases" or "host").
 */
export function runBadges(r: {
  roomBadges: string[];
  solved: boolean;
  playerCount: number;
  hintsUsed: number;
  wrongAttempts: number;
  durationMs: number;
  rank: number | null;
}): string[] {
  const out: string[] = [];
  if (r.playerCount >= 4) out.push("crew");
  if (r.solved) {
    if (r.playerCount === 1) out.push("solo");
    if (r.hintsUsed === 0) out.push("no-hints");
    if (r.wrongAttempts === 0) out.push("flawless");
    if (r.durationMs < HOUR_MS) out.push("under-hour");
    if (r.rank !== null && r.rank <= 10) out.push("top-ten");
  }
  for (const b of r.roomBadges) if (ROOM_BADGE_ACHIEVEMENT[b]) out.push(ROOM_BADGE_ACHIEVEMENT[b]);
  return out;
}

/**
 * The message id (and values) naming how a case ended, without naming a culprit: safe to show people
 * who haven't played. The train's ending titles name the accused, so its card only says solved or not.
 */
export function publicEndingMessage(gameId: string, ending: string | null, solved: boolean): { id: string; values?: Record<string, string> } {
  if (gameId === "nightingale-express") return { id: solved ? "result.ending.caught" : "result.ending.wrong" };
  if (gameId === "atlas-silent-worlds" && ending && ["restore", "sever", "reroute"].includes(ending)) return { id: `atlas.ending.${ending}` };
  if (gameId === "ada-voss" && ending) return { id: "room.ending.eyebrow", values: { ending } };
  return { id: "result.ending.escaped" };
}
