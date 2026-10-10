import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { parseProgress } from "@/server/logic";
import { decodeListings } from "@/server/content";
import { getT } from "@/i18n/server";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const t = await getT();
  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  const shift = Number(body.shift);
  if (!Number.isInteger(shift) || Math.abs(shift) > 1000) return error(400, t("api.decode.badShift"));
  const progress = parseProgress(ctx.room.progress);
  if (!progress.visitedSites.some((s) => s === "lostpaws.net" || s.startsWith("lostpaws.net/"))) {
    return error(403, t("api.decode.nothingYet"));
  }
  return json({ blocks: decodeListings(((shift % 26) + 26) % 26) });
}
