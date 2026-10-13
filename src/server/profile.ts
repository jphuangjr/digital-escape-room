import "server-only";
import type { User } from "@prisma/client";
import type { ProfileResponse } from "@/lib/types";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { GAMES } from "@/lib/games";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { THIEF } from "./train/content";
import { db } from "./db";
import { rankOf } from "./leaderboard";

const HOUR_MS = 60 * 60 * 1000;

/** Everything a profile page shows: totals, per-game bests, achievements and recent cases. */
export async function getProfile(user: User): Promise<ProfileResponse> {
  const cases = await db.caseRecord.findMany({ where: { userId: user.id }, orderBy: { finishedAt: "asc" } });
  const entries = await db.leaderboardEntry.findMany({ where: { roomRef: { in: cases.map((c) => c.roomRef) } } });
  const byRoom = new Map(entries.map((e) => [e.roomRef, e]));
  const ranks = new Map(await Promise.all(entries.map(async (e) => [e.roomRef, await rankOf(e)] as const)));

  const rows = cases.map((c) => {
    const e = byRoom.get(c.roomRef);
    // A train case is solved only by naming the thief; any finished Ada case escaped.
    const solved = e ? e.solved : c.gameId === TRAIN_GAME_ID ? c.ending === THIEF : true;
    return { c, e, solved, rank: ranks.get(c.roomRef) ?? null };
  });

  const earnedAt: Record<string, Date> = {};
  const earn = (id: string, at: Date) => {
    if (!earnedAt[id]) earnedAt[id] = at;
  };
  const adaEndings = new Set<string>();
  const solvedGames = new Set<string>();
  rows.forEach(({ c, e, solved, rank }, i) => {
    const at = c.finishedAt;
    earn("first-case", at);
    if (i === 4) earn("five-cases", at);
    if (c.wasHost) earn("host", at);
    if (c.playerCount >= 4) earn("crew", at);
    if (!solved) return;
    solvedGames.add(c.gameId);
    if (c.playerCount === 1) earn("solo", at);
    if (e && e.hintsUsed === 0) earn("no-hints", at);
    if (e && e.wrongAttempts === 0) earn("flawless", at);
    if (c.durationMs < HOUR_MS) earn("under-hour", at);
    if (rank !== null && rank <= 10) earn("top-ten", at);
    if (c.gameId === "ada-voss" && c.ending) {
      adaEndings.add(c.ending);
      if (adaEndings.size >= 2) earn("ada-both-endings", at);
    }
    if (c.badges.includes("compass")) earn("ada-compass", at);
    if (c.badges.includes("envelope")) earn("ada-envelope", at);
    if (c.gameId === TRAIN_GAME_ID) earn("nx-thief", at);
    if (c.badges.includes("everyclue")) earn("nx-every-clue", at);
    const live = GAMES.filter((g) => g.status === "live").map((g) => g.id);
    if (live.length > 0 && live.every((g) => solvedGames.has(g))) earn("all-games", at);
  });

  const played = new Set(cases.map((c) => c.gameId));
  const shownGames = GAMES.filter((g) => g.status === "live" || played.has(g.id)).map((g) => g.id);
  const boardSizes = new Map(
    await Promise.all(shownGames.map(async (g) => [g, await db.leaderboardEntry.count({ where: { gameId: g } })] as const)),
  );

  return {
    user: { name: user.name, image: user.image, since: user.createdAt.toISOString() },
    totals: {
      cases: cases.length,
      solved: rows.filter((r) => r.solved).length,
      hosted: cases.filter((c) => c.wasHost).length,
      totalMs: cases.reduce((n, c) => n + c.durationMs, 0),
    },
    games: shownGames.map((gameId) => {
      const mine = rows.filter((r) => r.c.gameId === gameId);
      const wins = mine.filter((r) => r.solved);
      const ranked = wins.map((r) => r.rank).filter((n): n is number => n !== null);
      return {
        gameId,
        plays: mine.length,
        solved: wins.length,
        bestMs: wins.length ? Math.min(...wins.map((r) => r.c.durationMs)) : null,
        bestRank: ranked.length ? Math.min(...ranked) : null,
        boardSize: boardSizes.get(gameId) ?? 0,
        endings: [...new Set(mine.map((r) => r.c.ending).filter((x): x is string => Boolean(x)))],
      };
    }),
    achievements: ACHIEVEMENTS.filter((a) => !a.gameId || shownGames.includes(a.gameId)).map((a) => ({
      ...a,
      earnedAt: earnedAt[a.id]?.toISOString() ?? null,
    })),
    recent: rows
      .slice(-20)
      .reverse()
      .map(({ c, e, solved, rank }) => ({
        gameId: c.gameId,
        finishedAt: c.finishedAt.toISOString(),
        durationMs: c.durationMs,
        ending: c.ending,
        solved,
        playerCount: c.playerCount,
        wasHost: c.wasHost,
        rank,
        hintsUsed: e?.hintsUsed ?? null,
        wrongAttempts: e?.wrongAttempts ?? null,
      })),
  };
}
