import type { LeaderboardResponse } from "@/lib/types";
import { getGame } from "@/lib/games";
import { error, json } from "@/server/http";
import { getLeaderboard } from "@/server/leaderboard";

/** Public leaderboard for one game. `?room=CODE` also returns that room's own entry and rank. */
export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  if (!getGame(gameId)) return error(404, "Unknown game.");
  const room = new URL(req.url).searchParams.get("room");
  try {
    return json<LeaderboardResponse>(await getLeaderboard(gameId, room));
  } catch {
    // Table missing (e.g. a preview build before the migration ships) or a DB hiccup: show it empty.
    return json<LeaderboardResponse>({ total: 0, top: [], mine: null });
  }
}
