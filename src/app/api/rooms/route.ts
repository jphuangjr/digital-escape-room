import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { error, json, readBody } from "@/server/http";
import { initialProgress, validateColor, validateDisplayName } from "@/server/logic";
import { newPlayerToken, newRoomCode, setPlayerCookie, sweepExpiredRooms } from "@/server/session";
import { track } from "@/server/analytics";

export async function POST(req: Request) {
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const name = validateDisplayName(body.displayName);
  if (!name.ok) return error(400, name.error);
  const color = validateColor(body.color);
  if (!color) return error(400, "Color must be a hex value like #c9a227.");

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
          data: { roomId: r.id, token, displayName: name.value, color },
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
