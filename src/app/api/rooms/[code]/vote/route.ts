import type { VoteState } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { isEnding } from "@/server/logic";
import { publish } from "@/server/realtime";
import { loadVoteState, maybeCloseVote } from "@/server/vote";
import { getT } from "@/i18n/server";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { player } = ctx;
  const t = await getT();
  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  if (!isEnding(body.choice)) return error(400, t("api.vote.badChoice"));

  let room = await maybeCloseVote(ctx.room);
  if (room.status !== "voting") return error(409, t("api.vote.notOpen"), { status: room.status });

  await db.endingVote.upsert({
    where: { roomId_playerId: { roomId: room.id, playerId: player.id } },
    create: { roomId: room.id, playerId: player.id, choice: body.choice },
    update: { choice: body.choice },
  });
  await db.player.update({ where: { id: player.id }, data: { lastSeenAt: new Date() } });
  await db.room.update({ where: { id: room.id }, data: { lastActivityAt: new Date() } });
  await publish(room.code, "vote.updated", { playerId: player.id });

  room = await maybeCloseVote(room);
  const vote = await loadVoteState(room);
  return json<VoteState>(vote ?? { deadline: null, votes: [], tieBreakNeeded: false });
}
