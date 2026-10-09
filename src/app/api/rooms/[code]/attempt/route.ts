import type { AttemptResponse, PuzzleId } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { ATTEMPT_WINDOW_MS, isPuzzleId, parseProgress, rateLimitDecision, VOTE_DURATION_MS } from "@/server/logic";
import { mutateProgress } from "@/server/progress";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { checkAnswer } from "@/server/content";
import { recordFinishedCase } from "@/server/cases";

const PREREQS: Partial<Record<PuzzleId, PuzzleId>> = { "final-phrase": "intranet-login", "tools-folder": "bonus-pin" };

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const { puzzleId } = body;
  if (!isPuzzleId(puzzleId)) return error(400, "Unknown puzzle.");
  if (typeof body.input !== "string") return error(400, "Missing input.");
  const input = body.input.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
  if (!input) return error(400, "Missing input.");

  const progress = parseProgress(room.progress);
  if (progress.solved.includes(puzzleId)) {
    return json<AttemptResponse>({ correct: true, message: "Already solved.", progress });
  }
  const prereq = PREREQS[puzzleId];
  if (prereq && !progress.solved.includes(prereq)) {
    return json<AttemptResponse>({ correct: false, message: "Nothing happens. This isn't ready yet.", progress }, 403);
  }

  const now = new Date();
  const recent = await db.attempt.findMany({
    where: { roomId: room.id, puzzleId, createdAt: { gte: new Date(now.getTime() - ATTEMPT_WINDOW_MS) } },
    select: { createdAt: true },
  });
  const rl = rateLimitDecision(
    recent.map((r) => r.createdAt),
    now,
  );
  if (rl.limited) {
    return json<AttemptResponse>(
      {
        correct: false,
        rateLimited: true,
        retryAfterSec: rl.retryAfterSec,
        message: `Too many attempts. Try again in ${rl.retryAfterSec}s.`,
        progress,
      },
      429,
      { "Retry-After": String(rl.retryAfterSec) },
    );
  }

  const correct = checkAnswer(puzzleId, input);
  const attempt = await db.attempt.create({ data: { roomId: room.id, playerId: player.id, puzzleId, input, correct } });
  track(room.id, player.id, "attempt", { puzzleId, correct });

  let nextProgress = progress;
  let solvedNow = false;
  if (correct) {
    const res = await mutateProgress(room.id, ({ progress: cur, status }) => {
      if (cur.solved.includes(puzzleId)) return null;
      const p = { ...cur, solved: [...cur.solved, puzzleId] };
      if (puzzleId === "bonus-pin" && !p.badges.includes("compass")) p.badges = [...p.badges, "compass"];
      if (puzzleId === "tools-folder" && !p.unlockedApps.includes("decoder")) p.unlockedApps = [...p.unlockedApps, "decoder"];
      const data =
        puzzleId === "final-phrase" && status === "playing"
          ? { status: "voting", voteDeadline: new Date(Date.now() + VOTE_DURATION_MS), finishedAt: new Date() }
          : undefined;
      return { progress: p, data };
    });
    nextProgress = res.progress;
    solvedNow = res.changed;
    if (solvedNow && puzzleId === "final-phrase") await recordFinishedCase(room.id).catch(() => {});
    if (solvedNow) {
      track(room.id, player.id, "puzzle.solved", {
        puzzleId,
        msFromRoomStart: attempt.createdAt.getTime() - room.createdAt.getTime(),
      });
    }
  } else {
    await db.room.update({ where: { id: room.id }, data: { lastActivityAt: new Date() } }).catch(() => {});
  }

  await publish(room.code, "attempt.logged", { puzzleId, correct, playerId: player.id });
  if (solvedNow) {
    await publish(room.code, "progress.updated", { reason: "solved", puzzleId });
    if (puzzleId === "final-phrase") await publish(room.code, "vote.updated", { opened: true });
  }

  return json<AttemptResponse>({
    correct,
    message: correct ? undefined : "That's not it.",
    progress: nextProgress,
  });
}
