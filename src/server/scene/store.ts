import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "../db";

/**
 * Read-modify-write a room's scene under a row lock, so two players acting at once (one taking the key while
 * another searches the coat) don't overwrite each other. Only writes when `fn` reports a change.
 */
export async function mutateScene<S, R extends { scene: S; changed: boolean }>(
  roomId: string,
  parse: (raw: unknown) => S,
  fn: (cur: S) => R,
): Promise<R> {
  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ scene: unknown }[]>`SELECT "scene" FROM "Room" WHERE "id" = ${roomId} FOR UPDATE`;
    if (!rows.length) throw new Error("room vanished");
    const res = fn(parse(rows[0].scene));
    if (res.changed) {
      await tx.room.update({
        where: { id: roomId },
        data: { scene: res.scene as unknown as Prisma.InputJsonValue, lastActivityAt: new Date() },
      });
    }
    return res;
  });
}
