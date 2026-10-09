import type { Prisma } from "@prisma/client";
import type { ReplaceRoomsRequired, RoomStatus } from "@/lib/types";
import { db } from "@/server/db";
import { error, json, readBody } from "@/server/http";
import { initialProgress, validateColor, validateDisplayName } from "@/server/logic";
import { newPlayerToken, newRoomCode, openRoomsHostedBy, setPlayerCookie, sweepExpiredRooms } from "@/server/session";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { getSessionUser, googleEnabled } from "@/server/auth";

export async function POST(req: Request) {
  // Hosting requires Google sign-in (joining stays optional). Skipped when OAuth isn't configured.
  const user = await getSessionUser();
  if (googleEnabled && !user) return error(401, "Sign in with Google to host a room.", { signInRequired: true });
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const name = validateDisplayName(body.displayName);
  if (!name.ok) return error(400, name.error);
  const color = validateColor(body.color);
  if (!color) return error(400, "Color must be a hex value like #c9a227.");

  // One open room per host: starting a new case deletes the old one, but only once the host has
  // confirmed (replaceExisting: true) after seeing which rooms will go.
  if (user) {
    const open = await openRoomsHostedBy(user.id);
    if (open.length > 0) {
      if (body.replaceExisting !== true) {
        return json<ReplaceRoomsRequired>(
          {
            error: "You already have an open room.",
            replaceRequired: true,
            openRooms: open.map((r) => ({
              code: r.code,
              gameId: r.gameId,
              status: r.status as RoomStatus,
              playerCount: r._count.players,
              createdAt: r.createdAt.toISOString(),
            })),
          },
          409,
        );
      }
      // Case records live in their own table and analytics rows are detached, so finished times survive.
      await db.room.deleteMany({ where: { id: { in: open.map((r) => r.id) } } });
      await Promise.all(open.map((r) => publish(r.code, "room.closed", { reason: "replaced" })));
    }
  }

  void sweepExpiredRooms();

  const token = newPlayerToken();
  for (let i = 0; i < 6; i++) {
    const code = newRoomCode();
    try {
      const room = await db.$transaction(async (tx) => {
        const r = await tx.room.create({
          data: { code, progress: initialProgress() as unknown as Prisma.InputJsonValue },
        });
        const p = await tx.player.create({
          data: { roomId: r.id, token, displayName: name.value, color, userId: user?.id, image: user?.image },
        });
        return tx.room.update({ where: { id: r.id }, data: { hostId: p.id } });
      });
      await setPlayerCookie(code, token);
      track(room.id, room.hostId, "room.created", {});
      return json({ code }, 201);
    } catch (err) {
      // Unique violation on code => retry with a new code.
      if ((err as { code?: string }).code === "P2002") continue;
      throw err;
    }
  }
  return error(503, "Could not allocate a room code, try again.");
}
