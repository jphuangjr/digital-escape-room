import { db } from "@/server/db";
import { isResponse, json, requirePlayer } from "@/server/http";
import { buildRoomState } from "@/server/state";
import { maybeCloseVote } from "@/server/vote";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  // Fetching state counts as being present.
  const player = await db.player.update({ where: { id: ctx.player.id }, data: { lastSeenAt: new Date() } });
  const room = await maybeCloseVote(ctx.room);
  return json(await buildRoomState(room, player));
}
