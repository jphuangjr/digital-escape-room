import "server-only";
import type { Room } from "@prisma/client";
import type { Ending, EndingDTO, VoteState } from "@/lib/types";
import { db } from "./db";
import { decideVote, isEnding, ONLINE_WINDOW_MS, parseProgress, tally } from "./logic";
import { publish } from "./realtime";
import { track } from "./analytics";
import { bonusEpilogue, endingText } from "./content";
import { recordCaseEnding } from "./cases";

export async function loadVoteState(room: Room): Promise<VoteState | null> {
  if (room.status === "playing") return null;
  const [votes, players] = await Promise.all([
    db.endingVote.findMany({ where: { roomId: room.id } }),
    db.player.findMany({ where: { roomId: room.id }, select: { id: true, lastSeenAt: true } }),
  ]);
  const now = new Date();
  let tieBreakNeeded = false;
  if (room.status === "voting") {
    const d = decideVote({
      votes,
      onlinePlayerIds: players.filter((p) => now.getTime() - p.lastSeenAt.getTime() <= ONLINE_WINDOW_MS).map((p) => p.id),
      deadline: room.voteDeadline,
      now,
    });
    tieBreakNeeded = d.action === "tie";
  }
  return {
    deadline: room.voteDeadline?.toISOString() ?? null,
    votes: votes.filter((v) => isEnding(v.choice)).map((v) => ({ playerId: v.playerId, choice: v.choice as Ending })),
    tieBreakNeeded,
  };
}

export async function buildEnding(room: Room): Promise<EndingDTO | null> {
  if (room.status !== "finished" || !isEnding(room.ending)) return null;
  const votes = await db.endingVote.findMany({ where: { roomId: room.id } });
  const summary = tally(votes);
  const text = endingText(room.ending);
  const progress = parseProgress(room.progress);
  return {
    ending: room.ending,
    title: text.title,
    body: text.body,
    // A tie can only be resolved by the host, so equal counts imply a host tie-break.
    summary: { ...summary, tieBrokenByHost: summary.EXPOSE === summary.PROTECT },
    bonusEpilogue: progress.solved.includes("bonus-pin") ? bonusEpilogue() : null,
  };
}

/** Atomically finish a voting room with `ending`. Returns the updated room, or null if already closed. */
export async function finishRoom(room: Room, ending: Ending, playerId: string | null, byHost: boolean): Promise<Room | null> {
  const res = await db.room.updateMany({
    where: { id: room.id, status: "voting" },
    data: { status: "finished", ending, lastActivityAt: new Date() },
  });
  if (res.count !== 1) return null;
  const updated = await db.room.findUnique({ where: { id: room.id } });
  if (!updated) return null;
  track(room.id, playerId, "ending", { ending, tieBrokenByHost: byHost });
  await recordCaseEnding(room.id, ending).catch(() => {});
  await publish(room.code, "ending.resolved", { ending });
  return updated;
}

/**
 * Close the vote if every online player has voted or the deadline passed and there's a majority.
 * Ties leave the room in "voting" with tieBreakNeeded (host resolves via /tiebreak).
 * Returns the (possibly updated) room.
 */
export async function maybeCloseVote(room: Room): Promise<Room> {
  if (room.status !== "voting") return room;
  const [votes, players] = await Promise.all([
    db.endingVote.findMany({ where: { roomId: room.id } }),
    db.player.findMany({ where: { roomId: room.id }, select: { id: true, lastSeenAt: true } }),
  ]);
  const now = new Date();
  const d = decideVote({
    votes,
    onlinePlayerIds: players.filter((p) => now.getTime() - p.lastSeenAt.getTime() <= ONLINE_WINDOW_MS).map((p) => p.id),
    deadline: room.voteDeadline,
    now,
  });
  if (d.action !== "close") return room;
  const updated = await finishRoom(room, d.ending, null, false);
  return updated ?? (await db.room.findUnique({ where: { id: room.id } })) ?? room;
}
