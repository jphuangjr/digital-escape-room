import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { blockedPlayerIds, setBlock } from "@/server/chatSafety";
import { getT } from "@/i18n/server";

/** POST {playerId, block} → block or unblock another player's chat for yourself; returns your blocked list. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const ctx = await requirePlayer((await params).code);
  if (isResponse(ctx)) return ctx;
  const t = await getT();
  const body = await readBody(req);
  if (typeof body?.playerId !== "string" || typeof body.block !== "boolean") return error(400, t("api.chat.badBlock"));
  if (!(await setBlock(ctx.room, ctx.player, body.playerId, body.block))) return error(404, t("api.chat.noSuchPlayer"));
  return json({ ok: true, blocked: await blockedPlayerIds(ctx.room.id, ctx.player) });
}
