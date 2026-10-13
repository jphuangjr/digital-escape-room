import type { SceneActionResponseOf } from "@/lib/scene/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { ATTEMPT_WINDOW_MS, ONLINE_WINDOW_MS, rateLimitDecision } from "@/server/logic";
import { publish } from "@/server/realtime";
import { sceneGame } from "@/server/scene/games";
import { mutateScene } from "@/server/scene/store";
import { recordLeaderboardEntry } from "@/server/leaderboard";
import { recordCaseEnding, recordFinishedCase } from "@/server/cases";
import { getLocale } from "@/i18n/server";

/** One player action in a physical-room game: take, operate, use, combine, unlock, hint or vote. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const game = sceneGame(room.gameId);
  if (!game) return error(400, "This room has no scene.");
  const body = await readBody(req);
  if (!body || !game.isAction(body)) return error(400, "Unknown action.");
  const action: unknown = body;
  const loc = await getLocale();
  const view = (scene: unknown) => game.dto(scene, { startedAt: room.createdAt, loc });

  const lock = game.guessedLock(action);
  if (lock !== null) {
    const puzzleId = game.lockPuzzleId(lock);
    const now = new Date();
    const recent = await db.attempt.findMany({
      where: { roomId: room.id, puzzleId, createdAt: { gte: new Date(now.getTime() - ATTEMPT_WINDOW_MS) } },
      select: { createdAt: true },
    });
    const rl = rateLimitDecision(recent.map((r) => r.createdAt), now);
    if (rl.limited) {
      return json<SceneActionResponseOf<unknown>>(
        { ok: false, message: game.tooManyMessage(loc, rl.retryAfterSec), retryAfterSec: rl.retryAfterSec, scene: view(game.parse(room.scene)) },
        429,
      );
    }
  }

  // The vote closes by itself once everyone online has voted.
  const players = await db.player.findMany({ where: { roomId: room.id }, select: { id: true, lastSeenAt: true } });
  const onlineIds = players
    .filter((p) => p.id === player.id || Date.now() - p.lastSeenAt.getTime() <= ONLINE_WINDOW_MS)
    .map((p) => p.id);
  const res = await mutateScene(room.id, (raw) => game.parse(raw), (cur) =>
    game.apply(cur, action, { id: player.id, name: player.displayName }, { hostId: room.hostId, onlineIds }, new Date(), loc),
  );
  const ending = res.finished ? game.ending(res.scene) : null;
  if (ending) {
    await db.room.update({ where: { id: room.id }, data: { status: "finished", finishedAt: new Date(), ending: ending.ending } });
    // Public results (skipped while the game is in staging).
    await Promise.all([
      recordLeaderboardEntry(room.id, { solved: ending.solved, hintsUsed: ending.hintsUsed, ending: ending.ending }).catch(() => {}),
      recordFinishedCase(room.id).then(() => recordCaseEnding(room.id, ending.ending)).catch(() => {}),
    ]);
  }
  if (res.attempt) {
    const puzzleId = game.lockPuzzleId(res.attempt.lock);
    await db.attempt.create({
      data: { roomId: room.id, playerId: player.id, puzzleId, input: res.attempt.input, correct: res.attempt.correct },
    });
    await publish(room.code, "attempt.logged", { puzzleId, correct: res.attempt.correct });
  }
  if (res.changed) await publish(room.code, "progress.updated", { reason: "scene" });
  return json<SceneActionResponseOf<unknown>>({ ok: res.ok, message: res.message, scene: view(res.scene) });
}
