import { db } from "@/server/db";
import { error, isResponse, json } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { adaPlaytestEvents, playtestReport, type PlaytestEvent } from "@/server/playtest";
import { sceneGame } from "@/server/scene/games";

/**
 * GET /api/admin/playtest?game=<gameId>[&days=30]  (signed-in admins)
 * Where playtesters get stuck: milestone funnel, abandoned rooms, hints and lock guesses. Scene games and Ada.
 */
const ADA = "ada-voss";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const url = new URL(req.url);
  const gameId = url.searchParams.get("game") ?? "";
  if (!sceneGame(gameId) && gameId !== ADA) return error(400, "Unknown game.");
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86_400_000);
  const asEvents = (rows: { roomRef: string; type: string; data: unknown; createdAt: Date }[]) =>
    rows.map((r) => ({ ...r, data: r.data && typeof r.data === "object" && !Array.isArray(r.data) ? (r.data as Record<string, unknown>) : null })) satisfies PlaytestEvent[];
  const select = { roomRef: true, type: true, data: true, createdAt: true } as const;
  let events: PlaytestEvent[];
  if (gameId === ADA) {
    // Ada's older events carry no gameId, so find its rooms by their room.created event and take all of theirs.
    const created = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, type: "room.created", data: { path: ["gameId"], equals: gameId } },
      select: { roomRef: true },
    });
    const refs = [...new Set(created.map((c) => c.roomRef))];
    const rows = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, roomRef: { in: refs }, type: { in: ["room.created", "site.visit", "attempt", "puzzle.solved", "hint", "ending"] } },
      select,
    });
    events = adaPlaytestEvents(gameId, asEvents(rows));
  } else {
    const rows = await db.analyticsEvent.findMany({
      where: { createdAt: { gte: since }, type: { in: ["milestone", "attempt", "puzzle.solved", "hint", "ending"] }, data: { path: ["gameId"], equals: gameId } },
      select,
    });
    events = asEvents(rows);
  }
  return json({ windowDays: days, ...playtestReport(gameId, events, new Date()) });
}
