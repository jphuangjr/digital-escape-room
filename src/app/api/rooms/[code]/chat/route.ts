import type { ChatMessageDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer, translateLogicError } from "@/server/http";
import { CHAT_HISTORY, chatCooldownSec, cleanChatBody } from "@/server/logic";
import { publish } from "@/server/realtime";
import { touchRoom } from "@/server/session";
import { getT } from "@/i18n/server";

type Row = { id: string; playerId: string; body: string; createdAt: Date };

function dto(m: Row, players: Map<string, { displayName: string; color: string }>, someone: string): ChatMessageDTO {
  const p = players.get(m.playerId);
  return {
    id: m.id,
    playerId: m.playerId,
    playerName: p?.displayName ?? someone,
    playerColor: p?.color ?? "#78716c",
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}

/** GET [?after=ISO] → up to the last 100 messages, oldest first (or only those newer than `after`). */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const ctx = await requirePlayer((await params).code);
  if (isResponse(ctx)) return ctx;
  const t = await getT();
  const afterRaw = new URL(req.url).searchParams.get("after");
  const after = afterRaw ? new Date(afterRaw) : null;
  if (after && Number.isNaN(after.getTime())) return error(400, t("api.chat.badAfter"));

  const [rows, players] = await Promise.all([
    db.chatMessage.findMany({
      where: { roomId: ctx.room.id, ...(after ? { createdAt: { gt: after } } : {}) },
      orderBy: { createdAt: "desc" },
      take: CHAT_HISTORY,
    }),
    db.player.findMany({ where: { roomId: ctx.room.id }, select: { id: true, displayName: true, color: true } }),
  ]);
  const byId = new Map(players.map((p) => [p.id, p]));
  return json({ messages: rows.reverse().map((m) => dto(m, byId, t("api.chat.someone"))) });
}

/** POST {body} → the saved message. Broadcast to the room as `chat.message` with the message itself. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const ctx = await requirePlayer((await params).code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const t = await getT();
  const cleaned = cleanChatBody((await readBody(req))?.body);
  if (!cleaned.ok) return error(400, translateLogicError(t, cleaned.error));

  const last = await db.chatMessage.findFirst({
    where: { roomId: room.id, playerId: player.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const wait = chatCooldownSec(last?.createdAt ?? null);
  if (wait > 0) return error(429, t("api.chat.slowDown"), { retryAfterSec: wait });

  const m = await db.chatMessage.create({ data: { roomId: room.id, playerId: player.id, body: cleaned.body } });
  const message = dto(m, new Map([[player.id, player]]), t("api.chat.someone"));
  await publish(room.code, "chat.message", message);
  void touchRoom(room);
  return json(message, 201);
}
