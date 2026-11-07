import "server-only";
import { randomInt } from "node:crypto";
import type { Player, Room } from "@prisma/client";
import { db } from "../db";
import { publish } from "../realtime";
import { mutateScene } from "../scene/store";
import { partyGame } from "./games";
import type { PartyGame, PartyResult } from "./registry";

/** A host who hasn't been seen for this long hands the controls to a stand-in, so the table never stalls. */
export const HOST_AWAY_MS = 90_000;

export const rand = (n: number) => randomInt(n);

/**
 * Who may use the host controls: the host, or while the host is away, the longest-present player who is here.
 * `players` must be in join order.
 */
export function effectiveHostId(room: Pick<Room, "hostId">, players: Pick<Player, "id" | "lastSeenAt">[], now = Date.now()): string | null {
  const here = (p: Pick<Player, "lastSeenAt">) => now - p.lastSeenAt.getTime() <= HOST_AWAY_MS;
  const host = players.find((p) => p.id === room.hostId);
  if (host && here(host)) return host.id;
  return players.find(here)?.id ?? room.hostId;
}

/** Keep Room.status in step with the game so finished tables don't count as a host's open room. */
async function syncStatus(room: Room, game: PartyGame, state: unknown): Promise<void> {
  const over = game.isOver(state);
  if (over && room.status !== "finished") {
    await db.room.update({ where: { id: room.id }, data: { status: "finished", finishedAt: new Date() } });
  } else if (!over && room.status === "finished") {
    await db.room.update({ where: { id: room.id }, data: { status: "playing", finishedAt: null } });
  }
}

/** Apply one change under the room's row lock, then tell the room and sync the room's status. */
export async function changeParty(
  room: Room,
  game: PartyGame,
  fn: (cur: unknown) => PartyResult<unknown>,
): Promise<PartyResult<unknown>> {
  const res = await mutateScene(room.id, (raw) => game.parse(raw), (cur) => {
    const r = fn(cur);
    return { ...r, scene: r.state };
  });
  if (res.changed) {
    await syncStatus(room, game, res.state);
    // A hint only: clients refetch their own view. Nothing secret ever goes over the broadcast channel.
    await publish(room.code, "progress.updated", { reason: "party" });
  }
  return res;
}

/** Move a party game past an expired phase. Cheap when nothing is due (no lock taken). */
export async function advancePartyIfDue(room: Room): Promise<void> {
  const game = partyGame(room.gameId);
  if (!game || !game.due(game.parse(room.scene), Date.now())) return;
  await changeParty(room, game, (cur) => game.advance(cur, Date.now()));
}
