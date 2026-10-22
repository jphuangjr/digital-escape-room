import type { Ending, MeResponse, RoomStatus } from "@/lib/types";
import { db } from "@/server/db";
import { json } from "@/server/http";
import { cookies } from "next/headers";
import { getSessionUser, googleEnabled } from "@/server/auth";
import { cookieName, ROOM_TTL_MS } from "@/server/session";
import { isAdmin, isTester, ownedGameIds } from "@/server/purchases";

/**
 * The signed-in user (if any), the unfinished rooms they're still in, and their finished cases with times.
 * Rooms come from Google sign-in and from this browser's room cookies, so guests see theirs too.
 */
export async function GET() {
  const user = await getSessionUser();
  const prefix = cookieName("");
  const tokens = (await cookies())
    .getAll()
    .filter((c) => c.name.startsWith(prefix))
    .map((c) => c.value)
    .slice(0, 40);
  const mine = [...(user ? [{ userId: user.id }] : []), ...(tokens.length ? [{ token: { in: tokens } }] : [])];

  const [ownedGames, tester, players, cases] = await Promise.all([
    user ? ownedGameIds(user) : Promise.resolve([] as string[]),
    isTester(user),
    mine.length
      ? db.player.findMany({
          // A finished room is a case now (listed under cases), not something to rejoin.
          where: { OR: mine, room: { status: { not: "finished" }, lastActivityAt: { gte: new Date(Date.now() - ROOM_TTL_MS) } } },
          include: { room: { include: { _count: { select: { players: true } } } } },
          orderBy: { room: { lastActivityAt: "desc" } },
          take: 20,
        })
      : Promise.resolve([]),
    user ? db.caseRecord.findMany({ where: { userId: user.id }, orderBy: { finishedAt: "desc" }, take: 50 }) : Promise.resolve([]),
  ]);

  return json<MeResponse>({
    googleEnabled,
    isAdmin: user ? isAdmin(user) : false,
    isTester: tester,
    ownedGames,
    user: user ? { name: user.name, email: user.email, image: user.image } : null,
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
