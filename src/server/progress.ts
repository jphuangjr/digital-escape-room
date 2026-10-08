import "server-only";
import type { Prisma } from "@prisma/client";
import type { RoomProgress, RoomStatus } from "@/lib/types";
import { db } from "./db";
import { parseProgress } from "./logic";

type Locked = { progress: RoomProgress; status: RoomStatus };
type Mutation = { progress: RoomProgress; data?: Omit<Prisma.RoomUpdateInput, "progress"> } | null;

/**
 * Read-modify-write the room's progress JSON under a row lock so concurrent requests
 * (visits, attempts) don't clobber each other. `fn` returns null for "no change".
 */
export async function mutateProgress(
  roomId: string,
  fn: (cur: Locked) => Mutation,
): Promise<{ progress: RoomProgress; status: RoomStatus; changed: boolean }> {
  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ progress: unknown; status: string }[]>`
      SELECT "progress", "status" FROM "Room" WHERE "id" = ${roomId} FOR UPDATE`;
    if (!rows.length) throw new Error("room vanished");
    const cur: Locked = { progress: parseProgress(rows[0].progress), status: rows[0].status as RoomStatus };
    const next = fn(cur);
    if (!next) return { ...cur, changed: false };
    const updated = await tx.room.update({
      where: { id: roomId },
      data: {
        ...next.data,
        progress: next.progress as unknown as Prisma.InputJsonValue,
        lastActivityAt: new Date(),
      },
      select: { status: true },
    });
    return { progress: next.progress, status: updated.status as RoomStatus, changed: true };
  });
}
