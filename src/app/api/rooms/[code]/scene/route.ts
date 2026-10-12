import type { SceneAction, SceneActionResponse } from "@/lib/train/types";
import { TRAIN_GAME_ID } from "@/lib/train/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { ATTEMPT_WINDOW_MS, ONLINE_WINDOW_MS, rateLimitDecision } from "@/server/logic";
import { publish } from "@/server/realtime";
import { applyAction, parseScene, sceneDTO } from "@/server/train/scene";
import { mutateScene } from "@/server/train/store";
import { THIEF } from "@/server/train/content";
import { recordLeaderboardEntry } from "@/server/leaderboard";
import { recordCaseEnding, recordFinishedCase } from "@/server/cases";
import { trainT } from "@/server/train/text";
import { getLocale } from "@/i18n/server";

const TYPES = new Set(["take", "operate", "use", "combine", "unlock", "item", "hint", "vote", "close-vote", "tiebreak"]);

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
  const loc = await getLocale();

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
        { ok: false, message: trainT(loc)("msg.tooMany", { s: rl.retryAfterSec }), retryAfterSec: rl.retryAfterSec, scene: sceneDTO(parseScene(room.scene), { startedAt: room.createdAt, loc }) },
        429,
      );
    }
  }

  // The vote closes by itself once everyone online has voted.
  const players = await db.player.findMany({ where: { roomId: room.id }, select: { id: true, lastSeenAt: true } });
  const onlineIds = players
    .filter((p) => p.id === player.id || Date.now() - p.lastSeenAt.getTime() <= ONLINE_WINDOW_MS)
    .map((p) => p.id);
  const res = await mutateScene(room.id, (cur) =>
    applyAction(cur, action, { id: player.id, name: player.displayName }, { hostId: room.hostId, onlineIds }, new Date(), loc),
  );
  if (res.finished && res.scene.ending) {
    await db.room.update({ where: { id: room.id }, data: { status: "finished", finishedAt: new Date(), ending: res.scene.ending.accused } });
    // Public results (skipped while the game is in staging).
    const solved = res.scene.ending.accused === THIEF;
    await Promise.all([
      recordLeaderboardEntry(room.id, { solved, hintsUsed: res.scene.hints.length, ending: res.scene.ending.accused }).catch(() => {}),
      recordFinishedCase(room.id).then(() => recordCaseEnding(room.id, res.scene.ending!.accused)).catch(() => {}),
    ]);
  }
  if (res.attempt) {
    await db.attempt.create({
      data: { roomId: room.id, playerId: player.id, puzzleId: `nx-${res.attempt.lock}`, input: res.attempt.input, correct: res.attempt.correct },
    });
    await publish(room.code, "attempt.logged", { puzzleId: `nx-${res.attempt.lock}`, correct: res.attempt.correct });
  }
  if (res.changed) await publish(room.code, "progress.updated", { reason: "scene" });
  return json<SceneActionResponse>({ ok: res.ok, message: res.message, scene: sceneDTO(res.scene, { startedAt: room.createdAt, loc }) });
}
