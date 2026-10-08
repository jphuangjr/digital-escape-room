import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { parseProgress } from "@/server/logic";
import { decodeListings } from "@/server/content";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const shift = Number(body.shift);
  if (!Number.isInteger(shift) || Math.abs(shift) > 1000) return error(400, "shift must be an integer.");
  const progress = parseProgress(ctx.room.progress);
  if (!progress.visitedSites.some((s) => s === "lostpaws.net" || s.startsWith("lostpaws.net/"))) {
    return error(403, "Nothing to decode yet.");
  }
  return json({ blocks: decodeListings(((shift % 26) + 26) % 26) });
}
