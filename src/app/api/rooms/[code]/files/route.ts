import { isResponse, json, requirePlayer } from "@/server/http";
import { parseProgress } from "@/server/logic";
import { bonusFiles } from "@/server/content";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const progress = parseProgress(ctx.room.progress);
  if (!progress.solved.includes("bonus-pin")) return json({ locked: true as const });
  return json({ locked: false as const, files: bonusFiles() });
}
