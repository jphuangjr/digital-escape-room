import type { SceneAction, SceneActionResponse } from "@/lib/train/types";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { ATTEMPT_WINDOW_MS, rateLimitDecision } from "@/server/logic";
import { publish } from "@/server/realtime";
import { applyAction, parseScene, sceneDTO } from "@/server/train/scene";
import { mutateScene } from "@/server/train/store";

const TYPES = new Set(["take", "operate", "use", "combine", "unlock"]);

/** One player action in a physical-room game: take, operate, use, combine or unlock. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  if (room.gameId !== TRAIN_GAME_ID) return error(400, "This room has no scene.");
  const body = await readBody(req);
  if (!body || typeof body.type !== "string" || !TYPES.has(body.type)) return error(400, "Unknown action.");
  const action = body as unknown as SceneAction;

  if (action.type === "unlock") {
    const puzzleId = `nx-${String(action.lock)}`;
    const now = new Date();
    const recent = await db.attempt.findMany({
      where: { roomId: room.id, puzzleId, createdAt: { gte: new Date(now.getTime() - ATTEMPT_WINDOW_MS) } },
      select: { createdAt: true },
    });
    const rl = rateLimitDecision(recent.map((r) => r.createdAt), now);
    if (rl.limited) {
      return json<SceneActionResponse>(
        { ok: false, message: `Too many tries. Wait ${rl.retryAfterSec}s.`, retryAfterSec: rl.retryAfterSec, scene: sceneDTO(parseScene(room.scene)) },
        429,
      );
    }
  }

  const res = await mutateScene(room.id, (cur) => applyAction(cur, action, { id: player.id, name: player.displayName }));
  if (res.attempt) {
    await db.attempt.create({
      data: { roomId: room.id, playerId: player.id, puzzleId: `nx-${res.attempt.lock}`, input: res.attempt.input, correct: res.attempt.correct },
    });
    await publish(room.code, "attempt.logged", { puzzleId: `nx-${res.attempt.lock}`, correct: res.attempt.correct });
  }
  if (res.changed) await publish(room.code, "progress.updated", { reason: "scene" });
  return json<SceneActionResponse>({ ok: res.ok, message: res.message, scene: sceneDTO(res.scene) });
}
