import "server-only";
import { db } from "./db";

/**
 * Write a permanent CaseRecord for every signed-in player once a room escapes (final phrase solved).
 * Records outlive the room, which is deleted after 48h of inactivity.
 */
export async function recordFinishedCase(roomId: string): Promise<void> {
  const room = await db.room.findUnique({ where: { id: roomId }, include: { players: true } });
  if (!room?.finishedAt) return;
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
          },
          update: {},
        }),
      ),
  );
}

/** Fill in the voted ending on the room's case records. */
export async function recordCaseEnding(roomId: string, ending: string): Promise<void> {
  await db.caseRecord.updateMany({ where: { roomRef: roomId }, data: { ending } });
}
