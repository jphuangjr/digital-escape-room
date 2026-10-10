import type { AttemptResponse, PuzzleId } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { ATTEMPT_WINDOW_MS, isPuzzleId, parseProgress, rateLimitDecision, VOTE_DURATION_MS, withDiscovery } from "@/server/logic";
import { mutateProgress } from "@/server/progress";
import { publish } from "@/server/realtime";
import { track } from "@/server/analytics";
import { checkAnswer } from "@/server/content";
import { recordFinishedCase } from "@/server/cases";
import { getT } from "@/i18n/server";

const PREREQS: Partial<Record<PuzzleId, PuzzleId>> = {
  "final-phrase": "admin-console",
  "admin-console": "intranet-login",
  "tools-folder": "bonus-pin",
};

/** Message ids for puzzles whose solve shows a confirmation. */
const SOLVED_MESSAGES: Partial<Record<PuzzleId, string>> = {
  "binary-lesson": "api.attempt.solved.binaryLesson",
  "admin-console": "api.attempt.solved.adminConsole",
};

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const t = await getT();
  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  const { puzzleId } = body;
  if (!isPuzzleId(puzzleId)) return error(400, t("api.attempt.unknownPuzzle"));
  if (typeof body.input !== "string") return error(400, t("api.attempt.missingInput"));
  const input = body.input.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
  if (!input) return error(400, t("api.attempt.missingInput"));

  const progress = parseProgress(room.progress);
  if (progress.solved.includes(puzzleId)) {
    return json<AttemptResponse>({ correct: true, message: t("api.attempt.alreadySolved"), progress });
  }
  const prereq = PREREQS[puzzleId];
  if (prereq && !progress.solved.includes(prereq)) {
    return json<AttemptResponse>({ correct: false, message: t("api.attempt.notReady"), progress }, 403);
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
        message: t("api.attempt.rateLimited", { s: rl.retryAfterSec }),
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
      const p = {
        ...cur,
        solved: [...cur.solved, puzzleId],
        discoveries: withDiscovery(cur.discoveries, { kind: "puzzle", puzzleId, playerId: player.id, playerName: player.displayName }),
      };
      if (puzzleId === "bonus-pin" && !p.badges.includes("compass")) p.badges = [...p.badges, "compass"];
      if (puzzleId === "tools-folder" && !p.unlockedApps.includes("decoder")) p.unlockedApps = [...p.unlockedApps, "decoder"];
      if (puzzleId === "binary-lesson" && !p.badges.includes("binary")) p.badges = [...p.badges, "binary"];
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
    message: correct ? (SOLVED_MESSAGES[puzzleId] ? t(SOLVED_MESSAGES[puzzleId]) : undefined) : t("api.attempt.wrong"),
    progress: nextProgress,
  });
}
