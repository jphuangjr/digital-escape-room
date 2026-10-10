import { db } from "@/server/db";
import { error, json, readBody, translateLogicError } from "@/server/http";
import { validateColor, validateDisplayName } from "@/server/logic";
import { getPlayerInRoom, getRoom, newPlayerToken, setPlayerCookie, touchRoom } from "@/server/session";
import { publish } from "@/server/realtime";
import { getSessionUser } from "@/server/auth";
import { getT } from "@/i18n/server";

const MAX_PLAYERS = 16;

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const t = await getT();
  const room = await getRoom(rawCode);
  if (!room) return error(404, t("api.room.notFound"));
  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  const name = validateDisplayName(body.displayName);
  if (!name.ok) return error(400, translateLogicError(t, name.error));
  const color = validateColor(body.color);
  if (!color) return error(400, t("api.player.badColor"));

  const user = await getSessionUser();

  // Rejoin (by cookie, or by Google account on a new device): keep identity, refresh name/color.
  const existing = await getPlayerInRoom(room);
  if (existing) {
    // Signing in after joining anonymously links this player to the account, unless the account
    // already has a different player in this room.
    const link =
      user && !existing.userId
        ? !(await db.player.findUnique({ where: { roomId_userId: { roomId: room.id, userId: user.id } } }))
        : false;
    await db.player.update({
      where: { id: existing.id },
      data: {
        displayName: name.value,
        color,
        lastSeenAt: new Date(),
        ...(link ? { userId: user!.id, image: user!.image } : {}),
      },
    });
    await setPlayerCookie(room.code, existing.token);
    await publish(room.code, "presence.updated", { playerId: existing.id });
    return json({ code: room.code });
  }

  const count = await db.player.count({ where: { roomId: room.id } });
  if (count >= MAX_PLAYERS) return error(409, t("api.room.full"));

  const token = newPlayerToken();
  const player = await db.player.create({
    data: { roomId: room.id, token, displayName: name.value, color, userId: user?.id, image: user?.image },
  });
  await setPlayerCookie(room.code, token);
  await touchRoom(room, true);
  await publish(room.code, "presence.updated", { playerId: player.id, joined: true });
  return json({ code: room.code });
}
