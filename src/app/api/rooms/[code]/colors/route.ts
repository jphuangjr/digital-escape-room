import type { TakenColor } from "@/lib/avatarColors";
import { db } from "@/server/db";
import { error, json } from "@/server/http";
import { getPlayerInRoom, getRoom } from "@/server/session";
import { getT } from "@/i18n/server";

/**
 * GET → `{ taken: [{color, name}] }`: the avatar colors other players in the room have, for the join forms. Open to
 * anyone with the room code, like joining; your own player (rejoining) isn't counted against you.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const room = await getRoom((await params).code);
  if (!room) return error(404, (await getT())("api.room.notFound"));
  const me = await getPlayerInRoom(room);
  const players = await db.player.findMany({
    where: { roomId: room.id, ...(me ? { id: { not: me.id } } : {}) },
    orderBy: { createdAt: "asc" },
    select: { color: true, displayName: true },
  });
  return json({ taken: players.map<TakenColor>((p) => ({ color: p.color.toLowerCase(), name: p.displayName })) });
}
