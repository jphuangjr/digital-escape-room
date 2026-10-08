import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { publish } from "@/server/realtime";
import { touchRoom } from "@/server/session";
import { isOnline } from "@/server/state";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const view =
    typeof body.view === "string" ? body.view.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 80) || null : null;

  const { player, room } = ctx;
  const wasOnline = isOnline(player);
  const changed = view !== player.currentView;
  await db.player.update({ where: { id: player.id }, data: { lastSeenAt: new Date(), currentView: view } });
  await touchRoom(room);
  if (changed || !wasOnline) await publish(room.code, "presence.updated", { playerId: player.id, view });
  return json({ ok: true });
}
