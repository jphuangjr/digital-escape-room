import { db } from "@/server/db";
import { error, isResponse, json } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { playtestReport, type PlaytestEvent } from "@/server/playtest";
import { sceneGame } from "@/server/scene/games";

/**
 * GET /api/admin/playtest?game=<gameId>[&days=30]  (signed-in admins)
 * Where playtesters get stuck in a scene game: milestone funnel, abandoned rooms, hints and lock guesses.
 */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const url = new URL(req.url);
  const gameId = url.searchParams.get("game") ?? "";
  if (!sceneGame(gameId)) return error(400, "Unknown game.");
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await db.analyticsEvent.findMany({
    where: { createdAt: { gte: since }, type: { in: ["milestone", "attempt", "puzzle.solved", "hint", "ending"] }, data: { path: ["gameId"], equals: gameId } },
    select: { roomRef: true, type: true, data: true, createdAt: true },
  });
  const events = rows.map((r) => ({ ...r, data: r.data && typeof r.data === "object" && !Array.isArray(r.data) ? (r.data as Record<string, unknown>) : null })) satisfies PlaytestEvent[];
  return json({ windowDays: days, ...playtestReport(gameId, events, new Date()) });
}
