import "server-only";
import type { LeaderboardEntry, Room } from "@prisma/client";
import type { Locale } from "@/i18n/config";
import { runBadges, type ResultCredit, type RoomResult } from "@/lib/result";
import { roomBadges } from "./cases";
import { db } from "./db";
import { boardWhere, rankOf } from "./leaderboard";
import { BONUS_PUZZLE_IDS } from "./logic";
import { sceneGame } from "./scene/games";

/**
 * A finished room's result for its own players: the leaderboard snapshot (or, for rooms that never got
 * one, the same counts taken now), the badges the run earned and who did what. Null until the room ends.
 */
export async function getRoomResult(room: Room, loc: Locale): Promise<RoomResult | null> {
  if (room.status !== "finished" || !room.finishedAt) return null;
  const game = sceneGame(room.gameId);
  const scene = game ? game.parse(room.scene) : null;
  const until = { lte: room.finishedAt };
  const mainPuzzles = { notIn: BONUS_PUZZLE_IDS };
  const [entry, players, solvedBy] = await Promise.all([
    db.leaderboardEntry.findUnique({ where: { roomRef: room.id } }),
    db.player.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" }, select: { id: true, displayName: true, color: true } }),
    db.attempt.groupBy({ by: ["playerId"], where: { roomId: room.id, correct: true }, _count: { _all: true } }),
  ]);

  let stats: Pick<RoomResult, "durationMs" | "hintsUsed" | "attempts" | "wrongAttempts" | "playerCount" | "solved">;
  if (entry) {
    stats = { durationMs: entry.durationMs, hintsUsed: entry.hintsUsed, attempts: entry.attempts, wrongAttempts: entry.wrongAttempts, playerCount: entry.playerCount, solved: entry.solved };
  } else {
    const ending = game && scene ? game.ending(scene) : null;
    const [attempts, wrongAttempts, hints] = await Promise.all([
      db.attempt.count({ where: { roomId: room.id, puzzleId: mainPuzzles, createdAt: until } }),
      db.attempt.count({ where: { roomId: room.id, puzzleId: mainPuzzles, correct: false, createdAt: until } }),
      db.hintRequest.count({ where: { roomId: room.id, createdAt: until } }),
    ]);
    stats = {
      durationMs: room.finishedAt.getTime() - room.createdAt.getTime(),
      hintsUsed: ending ? ending.hintsUsed : hints,
      attempts,
      wrongAttempts,
      playerCount: players.length,
      solved: ending ? ending.solved : true,
    };
  }
  const [rank, boardSize] = entry
    ? await Promise.all([rankOf(entry), db.leaderboardEntry.count({ where: boardWhere(room.gameId) })])
    : [null, 0];
  const testRun = Boolean(entry?.hidden);

  const finds = game && scene ? game.finds(scene, loc) : [];
  const solvedCount = new Map(solvedBy.map((s) => [s.playerId, s._count._all]));
  const credits: ResultCredit[] = players.map((p) => {
    const mine = finds.filter((f) => f.playerId === p.id);
    return {
      playerId: p.id,
      name: p.displayName,
      color: p.color,
      solved: solvedCount.get(p.id) ?? 0,
      found: mine.length,
      keyItems: [...new Set(mine.filter((f) => f.key).map((f) => f.item))],
    };
  });

  return {
    gameId: room.gameId,
    ending: room.ending,
    ...stats,
    rank,
    boardSize,
    testRun,
    badges: runBadges({ roomBadges: roomBadges(room), rank, ...stats }),
    // A test run has no public card to share.
    shareId: entry && !testRun ? entry.id : null,
    credits,
  };
}

/** What a public result card shows: no names, no answers, no credits. */
export type SharedResult = Omit<RoomResult, "credits" | "shareId" | "testRun"> & { finishedAt: string };

/**
 * A leaderboard entry as a public result card. The room may be long gone, so badges come from the team's
 * case records (kept for signed-in players) plus the ones the entry's own numbers earn.
 */
export async function getSharedResult(id: string): Promise<SharedResult | null> {
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return null;
  const entry: LeaderboardEntry | null = await db.leaderboardEntry.findUnique({ where: { id } }).catch(() => null);
  // An admin's test run has no public card: it 404s like an unknown id.
  if (!entry || entry.hidden) return null;
  const [rank, boardSize, record] = await Promise.all([
    rankOf(entry),
    db.leaderboardEntry.count({ where: boardWhere(entry.gameId) }),
    db.caseRecord.findFirst({ where: { roomRef: entry.roomRef }, select: { badges: true } }),
  ]);
  return {
    gameId: entry.gameId,
    ending: entry.ending,
    solved: entry.solved,
    durationMs: entry.durationMs,
    hintsUsed: entry.hintsUsed,
    attempts: entry.attempts,
    wrongAttempts: entry.wrongAttempts,
    playerCount: entry.playerCount,
    rank,
    boardSize,
    badges: runBadges({ roomBadges: record?.badges ?? [], rank, ...entry }),
    finishedAt: entry.finishedAt.toISOString(),
  };
}
