import { error, isResponse, json, requirePlayer } from "@/server/http";
import { getRoomResult } from "@/server/result";
import { getLocale, getT } from "@/i18n/server";

/** A finished room's stats, badges and credits, for the end-of-game reveal. Players only. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const result = await getRoomResult(ctx.room, await getLocale());
  if (!result) return error(409, (await getT())("result.notFinished"));
  return json(result);
}
