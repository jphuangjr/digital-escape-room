import "server-only";
import { db } from "./db";
import type { Room } from "@prisma/client";
import { getGame } from "@/lib/games";
import { parseProgress } from "./logic";
import { sceneGame } from "./scene/games";

/** Badges the team earned in a room, to keep on each case record. */
export function roomBadges(room: Pick<Room, "gameId" | "progress" | "scene">): string[] {
  const game = sceneGame(room.gameId);
  if (game) return game.badges(game.parse(room.scene));
  return parseProgress(room.progress).badges;
}

/**
 * Write a permanent CaseRecord for every signed-in player once a room escapes (final phrase solved).
 * Records outlive the room, which is deleted after 48h of inactivity.
 */
export async function recordFinishedCase(roomId: string): Promise<void> {
  const room = await db.room.findUnique({ where: { id: roomId }, include: { players: true } });
  if (!room?.finishedAt) return;
  if (getGame(room.gameId)?.status === "staging") return; // admin playtests aren't anyone's case history
  const durationMs = room.finishedAt.getTime() - room.createdAt.getTime();
  await Promise.all(
    room.players
      .filter((p) => p.userId)
      .map((p) =>
        db.caseRecord.upsert({
          where: { userId_roomRef: { userId: p.userId!, roomRef: room.id } },
          create: {
            userId: p.userId!,
            gameId: room.gameId,
            roomRef: room.id,
            roomCode: room.code,
            startedAt: room.createdAt,
            finishedAt: room.finishedAt!,
            durationMs,
            wasHost: p.id === room.hostId,
            playerCount: room.players.length,
            badges: roomBadges(room),
          },
          update: {},
        }),
      ),
  );
}

/** Fill in the voted ending on the room's case records, with any badges earned since the escape. */
export async function recordCaseEnding(roomId: string, ending: string): Promise<void> {
  const room = await db.room.findUnique({ where: { id: roomId }, select: { gameId: true, progress: true, scene: true } });
  await db.caseRecord.updateMany({ where: { roomRef: roomId }, data: { ending, ...(room ? { badges: roomBadges(room) } : {}) } });
}
