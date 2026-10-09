import { db } from "@/server/db";
import { error, json, readBody } from "@/server/http";
import { validateColor, validateDisplayName } from "@/server/logic";
import { getPlayerInRoom, getRoom, newPlayerToken, setPlayerCookie, touchRoom } from "@/server/session";
import { publish } from "@/server/realtime";

const MAX_PLAYERS = 16;

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const room = await getRoom(rawCode);
  if (!room) return error(404, "Room not found or expired.");
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const name = validateDisplayName(body.displayName);
  if (!name.ok) return error(400, name.error);
  const color = validateColor(body.color);
  if (!color) return error(400, "Color must be a hex value like #c9a227.");

  // Rejoin with an existing cookie: keep identity, refresh name/color.
  const existing = await getPlayerInRoom(room);
  if (existing) {
    await db.player.update({
      where: { id: existing.id },
      data: { displayName: name.value, color, lastSeenAt: new Date() },
    });
    await setPlayerCookie(room.code, existing.token);
    await publish(room.code, "presence.updated", { playerId: existing.id });
    return json({ code: room.code });
  }

  const count = await db.player.count({ where: { roomId: room.id } });
  if (count >= MAX_PLAYERS) return error(409, "This room is full.");

  const token = newPlayerToken();
  const player = await db.player.create({ data: { roomId: room.id, token, displayName: name.value, color } });
  await setPlayerCookie(room.code, token);
  await touchRoom(room, true);
  await publish(room.code, "presence.updated", { playerId: player.id, joined: true });
  return json({ code: room.code });
}
