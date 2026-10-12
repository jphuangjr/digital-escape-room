import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { parseScene, type TrainScene } from "./scene";

/**
 * Read-modify-write a train room's scene under a row lock, so two players acting at once (one taking
 * the key while another searches the coat) don't overwrite each other. `fn` returns null for "no change".
 */
export async function mutateScene<R extends { scene: TrainScene; changed: boolean }>(
  roomId: string,
  fn: (cur: TrainScene) => R,
): Promise<R> {
  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ scene: unknown }[]>`SELECT "scene" FROM "Room" WHERE "id" = ${roomId} FOR UPDATE`;
    if (!rows.length) throw new Error("room vanished");
    const res = fn(parseScene(rows[0].scene));
    if (res.changed) {
      await tx.room.update({
        where: { id: roomId },
        data: { scene: res.scene as unknown as Prisma.InputJsonValue, lastActivityAt: new Date() },
      });
    }
    return res;
  });
}
