import { db } from "@/server/db";
import { isResponse, json, requirePlayer } from "@/server/http";
import { buildRoomState } from "@/server/state";
import { maybeCloseVote } from "@/server/vote";
import { advancePartyIfDue } from "@/server/party/server";
import { getRoom } from "@/server/session";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  // Fetching state counts as being present.
  const player = await db.player.update({ where: { id: ctx.player.id }, data: { lastSeenAt: new Date() } });
  // Party games have no clock on the server: an expired phase moves on when someone looks.
  await advancePartyIfDue(ctx.room);
  const room = await maybeCloseVote((await getRoom(code)) ?? ctx.room);
  return json(await buildRoomState(room, player));
}
