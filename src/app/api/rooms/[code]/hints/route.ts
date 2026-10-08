import type { HintDTO, HintPuzzleId } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { hintCooldownUntil, nextHintTier } from "@/server/logic";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { touchRoom } from "@/server/session";
import { hintDTO } from "@/server/state";
import { HINT_PUZZLES } from "@/server/content";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const puzzleId = body.puzzleId as HintPuzzleId;
  if (typeof puzzleId !== "string" || !HINT_PUZZLES.includes(puzzleId)) return error(400, "Unknown hint puzzle.");

  const rows = (await db.hintRequest.findMany({ where: { roomId: room.id, puzzleId } })).map((h) => ({
    ...h,
    puzzleId: h.puzzleId as HintPuzzleId,
  }));
  const tier = nextHintTier(rows.map((r) => r.tier));
  if (tier === null) return error(409, "No more hints for this puzzle.", { maxed: true });
  const until = hintCooldownUntil(rows, puzzleId, new Date());
  if (until) return error(429, "Ada needs a moment before calling again.", { cooldownUntil: until.toISOString() });

  try {
    const created = await db.hintRequest.create({ data: { roomId: room.id, puzzleId, tier, playerId: player.id } });
    await touchRoom(room);
    track(room.id, player.id, "hint", { puzzleId, tier });
    await publish(room.code, "hint.unlocked", { puzzleId, tier });
    return json<HintDTO>(hintDTO(created), 201);
  } catch (err) {
    // Someone else in the room unlocked this tier at the same moment: return that one.
    if ((err as { code?: string }).code === "P2002") {
      const existing = await db.hintRequest.findUnique({
        where: { roomId_puzzleId_tier: { roomId: room.id, puzzleId, tier } },
      });
      if (existing) return json<HintDTO>(hintDTO(existing));
    }
    throw err;
  }
}
