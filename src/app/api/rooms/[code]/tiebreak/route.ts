import type { EndingDTO } from "@/lib/types";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { db } from "@/server/db";
import { isEnding } from "@/server/logic";
import { isOnline } from "@/server/state";
import { buildEnding, finishRoom, loadVoteState, maybeCloseVote } from "@/server/vote";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { player } = ctx;
  if (ctx.room.hostId !== player.id) {
    // Fallback so a room isn't stuck forever: if the host has gone offline, anyone may break the tie.
    const host = ctx.room.hostId ? await db.player.findUnique({ where: { id: ctx.room.hostId } }) : null;
    if (host && isOnline(host)) return error(403, "Only the host can break a tie.");
  }
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  if (!isEnding(body.choice)) return error(400, "choice must be EXPOSE or PROTECT.");

  let room = await maybeCloseVote(ctx.room);
  if (room.status === "voting") {
    const vote = await loadVoteState(room);
    if (!vote?.tieBreakNeeded) return error(409, "There is no tie to break yet.");
    room = (await finishRoom(room, body.choice, player.id, true)) ?? room;
  }
  const ending = await buildEnding(room);
  if (!ending) return error(409, "Voting is not open.");
  return json<EndingDTO>(ending);
}
