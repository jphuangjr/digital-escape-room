import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Player, Room } from "@prisma/client";
import type { PartyTestInfo } from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/avatarColors";
import { db } from "../db";
import { getSessionUser } from "../auth";
import { isAdmin } from "../purchases";

/**
 * Test rooms for admins: the host of a party-game room who is an admin may fill the table with bots, look at the
 * game through any bot's eyes, and make the bots' moves. Bots are ordinary Player rows whose token starts with
 * BOT_PREFIX, so nothing else in the game needs to know about them, and an admin can never look through a real
 * player's eyes.
 */
export const BOT_PREFIX = "bot_";

export const BOT_NAMES = [
  "Chad",
  "Brittany",
  "Kyle",
  "Madison",
  "Tyler",
  "Ashley",
  "Brayden",
  "Kayleigh",
  "Logan",
  "Skyler",
  "Hunter",
  "Paisley",
  "Jaxon",
  "Nevaeh",
  "Ryker",
];

export const isBot = (p: Pick<Player, "token">) => p.token.startsWith(BOT_PREFIX);

const viewCookie = (code: string) => `pv_${code}`;

/** Whether this player may use the test tools here: an admin hosting the room. */
export async function canTest(room: Pick<Room, "hostId">, player: Pick<Player, "id" | "userId">): Promise<boolean> {
  if (room.hostId !== player.id || !player.userId) return false;
  const user = await getSessionUser();
  return Boolean(user && user.id === player.userId && isAdmin(user));
}

/** Who this player is looking through: a bot they picked, or themselves. */
export async function viewerId(room: Room, player: Player, players?: Pick<Player, "id" | "token">[]): Promise<string> {
  const asId = (await cookies()).get(viewCookie(room.code))?.value;
  if (!asId || asId === player.id) return player.id;
  const bot = players ? players.find((p) => p.id === asId) : await db.player.findFirst({ where: { id: asId, roomId: room.id }, select: { id: true, token: true } });
  if (!bot || !isBot(bot) || !(await canTest(room, player))) return player.id;
  return bot.id;
}

export async function setViewer(code: string, playerId: string | null): Promise<void> {
  const jar = await cookies();
  if (!playerId) jar.delete(viewCookie(code));
  else jar.set(viewCookie(code), playerId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

/** Add bots until the room has `total` players. Returns how many were added. */
export async function addBots(room: Room, total: number): Promise<number> {
  const players = await db.player.findMany({ where: { roomId: room.id }, select: { displayName: true } });
  const used = new Set(players.map((p) => p.displayName));
  const names = BOT_NAMES.filter((n) => !used.has(n));
  const want = Math.max(0, Math.min(total - players.length, names.length));
  for (let i = 0; i < want; i++) {
    await db.player.create({
      data: {
        roomId: room.id,
        token: BOT_PREFIX + randomBytes(18).toString("base64url"),
        displayName: names[i],
        color: AVATAR_COLORS[(players.length + i) % AVATAR_COLORS.length],
      },
    });
  }
  return want;
}

/** What the test bar shows: every player, with roles (it's the admin's own test table). */
export function testInfo(viewingAs: string, players: Pick<Player, "id" | "token" | "displayName">[], roles: Map<string, string>): PartyTestInfo {
  return {
    viewingAs,
    players: players.map((p) => ({ id: p.id, name: p.displayName, bot: isBot(p), role: (roles.get(p.id) as PartyTestInfo["players"][number]["role"]) ?? null })),
  };
}
