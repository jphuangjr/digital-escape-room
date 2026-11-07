import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { publish } from "@/server/realtime";
import { partyGame } from "@/server/party/games";
import { changeParty, effectiveHostId, rand } from "@/server/party/server";

/**
 * One action in a party game: start, settings, ready, pick, vote, tick, skip, pause, resume, end or kick.
 * Returns the caller's own view, which is the only place their secrets ever travel.
 */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const game = partyGame(room.gameId);
  if (!game) return error(400, "This room isn't a party game.");
  const body = await readBody(req);
  if (!body || !game.isAction(body)) return error(400, "Unknown action.");

  const now = new Date();
  await db.player.update({ where: { id: player.id }, data: { lastSeenAt: now } });
  const players = await db.player.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" }, select: { id: true, lastSeenAt: true } });
  const hostId = effectiveHostId(room, players.map((p) => (p.id === player.id ? { ...p, lastSeenAt: now } : p)), now.getTime());
  const partyCtx = { playerId: player.id, hostId, roomPlayerIds: players.map((p) => p.id), now: now.getTime(), rand };

  const res = await changeParty(room, game, (cur) => game.apply(cur, body, partyCtx));
  if (!res.ok) return error(409, res.error ?? "That didn't work.", { party: game.view(res.state, player.id, { hostId }) });

  // Removing a player between games: the game has checked it's allowed.
  if (body.type === "kick" && typeof body.playerId === "string" && body.playerId !== room.hostId) {
    const gone = await db.player.deleteMany({ where: { id: body.playerId, roomId: room.id } });
    if (gone.count) await publish(room.code, "presence.updated", { playerId: body.playerId, left: true });
  }
  return json({ ok: true, party: game.view(res.state, player.id, { hostId }) });
}
