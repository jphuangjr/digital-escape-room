import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { publish } from "@/server/realtime";
import { partyGame } from "@/server/party/games";
import { changeParty, effectiveHostId, rand } from "@/server/party/server";
import type { PartyResult } from "@/server/party/registry";
import { addBots, canTest, isBot, setViewer, viewerId } from "@/server/party/test";
import { MAX_PLAYERS } from "@/lib/allhands/types";

/**
 * Admin test rooms (the admin must be hosting):
 * - `{action: "fill", total}`: add bots until the table has `total` players (between games only).
 * - `{action: "viewAs", playerId|null}`: look at (and play) the game as one of the bots, or as yourself again.
 * - `{action: "botsAct"}`: every bot makes its move for this phase (except the one you're looking through).
 */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const ctx = await requirePlayer((await params).code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const game = partyGame(room.gameId);
  if (!game) return error(400, "This room isn't a party game.");
  if (!(await canTest(room, player))) return error(403, "Test tools are for admins hosting the room.");
  const body = await readBody(req);
  const players = await db.player.findMany({ where: { roomId: room.id }, orderBy: { createdAt: "asc" } });

  switch (body?.action) {
    case "fill": {
      const phase = (game.parse(room.scene) as { phase?: string }).phase;
      if (phase !== "lobby" && phase !== "over") return error(409, "Add bots between games.");
      const total = typeof body.total === "number" ? Math.min(MAX_PLAYERS, Math.max(1, Math.floor(body.total))) : 8;
      const added = await addBots(room, total);
      if (added) await publish(room.code, "presence.updated", { reason: "bots" });
      return json({ ok: true, added });
    }

    case "viewAs": {
      const id = typeof body.playerId === "string" ? body.playerId : null;
      const target = id ? players.find((p) => p.id === id) : null;
      if (id && id !== player.id && (!target || !isBot(target))) return error(400, "You can only look through a bot's eyes.");
      await setViewer(room.code, id && id !== player.id ? id : null);
      return json({ ok: true });
    }

    case "botsAct": {
      const as = await viewerId(room, player, players);
      const bots = players.filter((p) => isBot(p) && p.id !== as);
      const now = Date.now();
      const hostId = effectiveHostId(room, players, now);
      const roomPlayerIds = players.map((p) => p.id);
      let moved = 0;
      const res = await changeParty(room, game, (cur) => {
        let state = cur;
        let changed = false;
        for (const bot of bots) {
          const move = game.botMove?.(state, bot.id, rand);
          if (!move) continue;
          const r: PartyResult<unknown> = game.apply(state, move, { playerId: bot.id, hostId, roomPlayerIds, now, rand });
          if (r.ok && r.changed) {
            state = r.state;
            changed = true;
            moved++;
          }
        }
        return { state, changed, ok: true };
      });
      return json({ ok: res.ok, moved });
    }

    default:
      return error(400, "Unknown test action.");
  }
}
