import "server-only";
import type { Player, Room } from "@prisma/client";
import { db } from "./db";

export const REPORT_REASONS = ["abuse", "spam", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/**
 * Players in this room whose chat `me` doesn't see: those blocked in this room, plus (when `me` is signed in)
 * anyone here whose account `me` blocked in an earlier room.
 */
export async function blockedPlayerIds(roomId: string, me: Pick<Player, "id" | "userId">): Promise<string[]> {
  const [here, accounts] = await Promise.all([
    db.playerBlock.findMany({ where: { blockerId: me.id }, select: { blockedId: true } }),
    me.userId ? db.userBlock.findMany({ where: { blockerUserId: me.userId }, select: { blockedUserId: true } }) : [],
  ]);
  const ids = new Set(here.map((b) => b.blockedId));
  if (accounts.length) {
    const players = await db.player.findMany({
      where: { roomId, userId: { in: accounts.map((a) => a.blockedUserId) } },
      select: { id: true },
    });
    for (const p of players) ids.add(p.id);
  }
  ids.delete(me.id);
  return [...ids];
}

/**
 * Block or unblock another player in this room. When both are signed in, the block also follows their account
 * into future rooms (and unblocking lifts that too). False if the target isn't another player in the room.
 */
export async function setBlock(room: Room, me: Player, targetId: string, block: boolean): Promise<boolean> {
  if (targetId === me.id) return false;
  const target = await db.player.findFirst({ where: { id: targetId, roomId: room.id } });
  if (!target) return false;
  const accounts = me.userId && target.userId && me.userId !== target.userId ? { blockerUserId: me.userId, blockedUserId: target.userId } : null;
  if (block) {
    await db.playerBlock.upsert({
      where: { blockerId_blockedId: { blockerId: me.id, blockedId: target.id } },
      create: { roomId: room.id, blockerId: me.id, blockedId: target.id },
      update: {},
    });
    if (accounts) await db.userBlock.upsert({ where: { blockerUserId_blockedUserId: accounts }, create: accounts, update: {} });
  } else {
    await db.playerBlock.deleteMany({ where: { blockerId: me.id, blockedId: target.id } });
    if (accounts) await db.userBlock.deleteMany({ where: accounts });
  }
  return true;
}

/**
 * Report a chat message for admin review: a copy of the text (unmasked) and who's involved is kept after the
 * room expires. Reporting the same message twice is a no-op. False if it isn't someone else's message in this room.
 */
export async function reportMessage(room: Room, me: Player, messageId: string, reason: ReportReason): Promise<boolean> {
  const msg = await db.chatMessage.findFirst({ where: { id: messageId, roomId: room.id } });
  if (!msg || msg.playerId === me.id) return false;
  const author = await db.player.findUnique({ where: { id: msg.playerId } });
  await db.chatReport.upsert({
    where: { messageId_reporterPlayerId: { messageId, reporterPlayerId: me.id } },
    create: {
      roomRef: room.id,
      gameId: room.gameId,
      messageId,
      body: msg.body,
      reason,
      reportedPlayerId: msg.playerId,
      reportedName: author?.displayName ?? "?",
      reportedUserId: author?.userId ?? null,
      reporterPlayerId: me.id,
      reporterName: me.displayName,
      reporterUserId: me.userId,
    },
    update: {},
  });
  return true;
}
