import type { Ending, MeResponse, RoomStatus } from "@/lib/types";
import { db } from "@/server/db";
import { json } from "@/server/http";
import { getSessionUser, googleEnabled } from "@/server/auth";
import { ROOM_TTL_MS } from "@/server/session";

/** The signed-in user (if any), their rooms that are still open, and their finished cases with times. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return json<MeResponse>({ googleEnabled, user: null, activeRooms: [], cases: [] });

  const [players, cases] = await Promise.all([
    db.player.findMany({
      where: { userId: user.id, room: { lastActivityAt: { gte: new Date(Date.now() - ROOM_TTL_MS) } } },
      include: { room: { include: { _count: { select: { players: true } } } } },
      orderBy: { room: { lastActivityAt: "desc" } },
      take: 20,
    }),
    db.caseRecord.findMany({ where: { userId: user.id }, orderBy: { finishedAt: "desc" }, take: 50 }),
  ]);

  return json<MeResponse>({
    googleEnabled,
    user: { name: user.name, email: user.email, image: user.image },
    activeRooms: players.map((p) => ({
      code: p.room.code,
      gameId: p.room.gameId,
      status: p.room.status as RoomStatus,
      isHost: p.id === p.room.hostId,
      playerCount: p.room._count.players,
      createdAt: p.room.createdAt.toISOString(),
    })),
    cases: cases.map((c) => ({
      gameId: c.gameId,
      roomCode: c.roomCode,
      startedAt: c.startedAt.toISOString(),
      finishedAt: c.finishedAt.toISOString(),
      durationMs: c.durationMs,
      ending: (c.ending as Ending | null) ?? null,
      wasHost: c.wasHost,
      playerCount: c.playerCount,
    })),
  });
}
