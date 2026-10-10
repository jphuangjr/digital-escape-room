import type { EndingDTO } from "@/lib/types";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { db } from "@/server/db";
import { isEnding } from "@/server/logic";
import { isOnline } from "@/server/state";
import { buildEnding, finishRoom, loadVoteState, maybeCloseVote } from "@/server/vote";
import { getT } from "@/i18n/server";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { player } = ctx;
  const t = await getT();
  if (ctx.room.hostId !== player.id) {
    // Fallback so a room isn't stuck forever: if the host has gone offline, anyone may break the tie.
    const host = ctx.room.hostId ? await db.player.findUnique({ where: { id: ctx.room.hostId } }) : null;
    if (host && isOnline(host)) return error(403, t("api.vote.hostOnlyTiebreak"));
  }
  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  if (!isEnding(body.choice)) return error(400, t("api.vote.badChoice"));

  let room = await maybeCloseVote(ctx.room);
  if (room.status === "voting") {
    const vote = await loadVoteState(room);
    if (!vote?.tieBreakNeeded) return error(409, t("api.vote.noTie"));
    room = (await finishRoom(room, body.choice, player.id, true)) ?? room;
  }
  const ending = await buildEnding(room);
  if (!ending) return error(409, t("api.vote.notOpen"));
  return json<EndingDTO>(ending);
}
