import "server-only";
import type { Ending, LeaderboardResponse, LeaderboardRow } from "@/lib/types";
import type { LeaderboardEntry } from "@prisma/client";
import { db } from "./db";
import { BONUS_PUZZLE_IDS, normalizeRoomCode } from "./logic";
import { getGame } from "@/lib/games";
import { isAdmin } from "./purchases";

export const LEADERBOARD_SIZE = 10;
const MAX_INT = 2_147_483_647;

/**
 * Snapshot a room's result onto its game's leaderboard when the final puzzle is solved: who played,
 * how long it took (room creation to final answer), and how many answers and hints it took.
 * Runs once per room; later activity doesn't change the entry.
 */
export async function recordLeaderboardEntry(
  roomId: string,
  extra: { solved?: boolean; hintsUsed?: number; ending?: string } = {},
): Promise<void> {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { players: { orderBy: { createdAt: "asc" }, select: { displayName: true, color: true, user: { select: { email: true } } } } },
  });
  if (!room?.finishedAt) return;
  // Games in staging (admin playtests) stay off the public board.
  if (getGame(room.gameId)?.status === "staging") return;
  const until = { lte: room.finishedAt };
  const mainPuzzles = { notIn: BONUS_PUZZLE_IDS }; // the HarbourMail Easter egg doesn't count against a team
  const [attempts, wrongAttempts, hintsUsed] = await Promise.all([
    db.attempt.count({ where: { roomId, puzzleId: mainPuzzles, createdAt: until } }),
    db.attempt.count({ where: { roomId, puzzleId: mainPuzzles, correct: false, createdAt: until } }),
    db.hintRequest.count({ where: { roomId, createdAt: until } }),
  ]);
  await db.leaderboardEntry.upsert({
    where: { roomRef: room.id },
    create: {
      gameId: room.gameId,
      roomRef: room.id,
      players: room.players.map((p) => ({ name: p.displayName, color: p.color })),
      playerCount: room.players.length,
      startedAt: room.createdAt,
      finishedAt: room.finishedAt,
      durationMs: Math.min(room.finishedAt.getTime() - room.createdAt.getTime(), MAX_INT),
      attempts,
      wrongAttempts,
      hintsUsed: extra.hintsUsed ?? hintsUsed,
      solved: extra.solved ?? true,
      ending: extra.ending ?? null,
      hidden: isAdminRun(room.players),
    },
    update: {},
  });
}

/**
 * A run the site's admins played by themselves (a test run): every player in the room is a signed-in
 * admin. One guest or non-admin player (tester-key holders included) makes it a normal run. Decided by
 * account, never by display name. Its entry is kept but hidden from every public board and rank.
 */
export function isAdminRun(players: { user: { email: string | null } | null }[]): boolean {
  return players.length > 0 && players.every((p) => isAdmin(p.user));
}

/** The entries anyone can see on a game's board: test runs left out. */
export function boardWhere(gameId: string) {
  return { gameId, hidden: false };
}

/** Public entries that place ahead of `own` under the board's ordering. */
export function aheadWhere(own: Pick<LeaderboardEntry, "gameId" | "solved" | "durationMs" | "wrongAttempts" | "finishedAt">) {
  const sameSolved = {
    OR: [
      { durationMs: { lt: own.durationMs } },
      { durationMs: own.durationMs, wrongAttempts: { lt: own.wrongAttempts } },
      { durationMs: own.durationMs, wrongAttempts: own.wrongAttempts, finishedAt: { lt: own.finishedAt } },
    ],
  };
  return own.solved
    ? { ...boardWhere(own.gameId), solved: true, ...sameSolved }
    : { ...boardWhere(own.gameId), OR: [{ solved: true }, { solved: false, ...sameSolved }] };
}

export async function recordLeaderboardEnding(roomId: string, ending: string): Promise<void> {
  await db.leaderboardEntry.updateMany({ where: { roomRef: roomId }, data: { ending } });
}

// Solved beats unsolved; then faster time wins; on equal times, fewer wrong answers, then whoever finished first.
const ORDER = [{ solved: "desc" }, { durationMs: "asc" }, { wrongAttempts: "asc" }, { finishedAt: "asc" }] as const;

function toRow(e: LeaderboardEntry, rank: number, mine: boolean): LeaderboardRow {
  const players = Array.isArray(e.players) ? (e.players as { name?: unknown; color?: unknown }[]) : [];
  return {
    rank,
    players: players.map((p) => ({ name: String(p.name ?? "?"), color: String(p.color ?? "#888") })),
    playerCount: e.playerCount,
    durationMs: e.durationMs,
    attempts: e.attempts,
    wrongAttempts: e.wrongAttempts,
    hintsUsed: e.hintsUsed,
    ending: (e.ending as Ending | null) ?? null,
    solved: e.solved,
    finishedAt: e.finishedAt.toISOString(),
    mine,
  };
}

/** Top teams for a game, plus the given room's own entry and rank when it has one. */
export async function getLeaderboard(gameId: string, roomCode?: string | null): Promise<LeaderboardResponse> {
  const code = roomCode ? normalizeRoomCode(roomCode) : null;
  const room = code ? await db.room.findUnique({ where: { code }, select: { id: true } }) : null;
  const [top, total, own] = await Promise.all([
    db.leaderboardEntry.findMany({ where: boardWhere(gameId), orderBy: [...ORDER], take: LEADERBOARD_SIZE }),
    db.leaderboardEntry.count({ where: boardWhere(gameId) }),
    room ? db.leaderboardEntry.findUnique({ where: { roomRef: room.id } }) : null,
  ]);
  const rank = own && own.gameId === gameId ? await rankOf(own) : null;
  const mine = own && rank !== null ? toRow(own, rank, true) : null;
  return {
    total,
    top: top.map((e, i) => toRow(e, i + 1, e.id === own?.id)),
    mine,
  };
}

/** An entry's place on its game's public board (1 = best), under the board's own ordering. Null for a hidden test run. */
export async function rankOf(own: LeaderboardEntry): Promise<number | null> {
  if (own.hidden) return null;
  return (await db.leaderboardEntry.count({ where: aheadWhere(own) })) + 1;
}

/** Recent entries (hidden or not) with their players, for the admin page's hide/unhide control. */
export async function recentEntries(take = 60) {
  const rows = await db.leaderboardEntry.findMany({ orderBy: { finishedAt: "desc" }, take });
  return rows.map((e) => ({
    id: e.id,
    gameId: e.gameId,
    finishedAt: e.finishedAt.toISOString(),
    durationMs: e.durationMs,
    solved: e.solved,
    hidden: e.hidden,
    players: toRow(e, 0, false).players,
  }));
}

export async function setEntryHidden(id: string, hidden: boolean): Promise<boolean> {
  return (await db.leaderboardEntry.updateMany({ where: { id }, data: { hidden } })).count > 0;
}
