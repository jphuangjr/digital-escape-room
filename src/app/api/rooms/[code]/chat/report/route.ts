import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { blockedPlayerIds, REPORT_REASONS, reportMessage, setBlock, type ReportReason } from "@/server/chatSafety";
import { db } from "@/server/db";
import { getT } from "@/i18n/server";

/** POST {messageId, reason, block?} → report a message for review, and optionally block its author too. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const ctx = await requirePlayer((await params).code);
  if (isResponse(ctx)) return ctx;
  const t = await getT();
  const body = await readBody(req);
  const reason = body?.reason as ReportReason;
  if (typeof body?.messageId !== "string" || !REPORT_REASONS.includes(reason)) return error(400, t("api.chat.badReport"));
  if (!(await reportMessage(ctx.room, ctx.player, body.messageId, reason))) return error(404, t("api.chat.noSuchMessage"));
  if (body.block === true) {
    const msg = await db.chatMessage.findUnique({ where: { id: body.messageId }, select: { playerId: true } });
    if (msg) await setBlock(ctx.room, ctx.player, msg.playerId, true);
  }
  return json({ ok: true, blocked: await blockedPlayerIds(ctx.room.id, ctx.player) });
}
