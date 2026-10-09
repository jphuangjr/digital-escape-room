import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export type AnalyticsType = "site.visit" | "attempt" | "hint" | "puzzle.solved" | "room.created" | "ending";

/** Fire-and-forget analytics write. Never throws, never blocks the response. */
export function track(roomId: string, playerId: string | null, type: AnalyticsType, data?: Record<string, unknown>): void {
  db.analyticsEvent
    .create({ data: { roomId, roomRef: roomId, playerId, type, data: (data ?? undefined) as Prisma.InputJsonValue | undefined } })
    .catch((err: unknown) => console.warn("[analytics] write failed", err instanceof Error ? err.message : err));
}
