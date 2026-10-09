import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import type { Player, Room } from "@prisma/client";
import { db } from "./db";
import { generateRoomCode, normalizeRoomCode } from "./logic";
import { getSessionUser } from "./auth";

export const ROOM_TTL_MS = 48 * 60 * 60 * 1000;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function newRoomCode(): string {
  return generateRoomCode((n) => randomInt(n));
}

export function newPlayerToken(): string {
  return randomBytes(24).toString("base64url");
}

export function cookieName(code: string): string {
  return `pt_${code}`;
}

export async function setPlayerCookie(code: string, token: string): Promise<void> {
  const jar = await cookies();
  jar.set(cookieName(code), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function isExpired(room: Pick<Room, "lastActivityAt">, now = new Date()): boolean {
  return now.getTime() - room.lastActivityAt.getTime() > ROOM_TTL_MS;
}

/** Room by code, treating rooms idle > 48h as nonexistent (and deleting them lazily). */
export async function getRoom(rawCode: string): Promise<Room | null> {
  const code = normalizeRoomCode(rawCode);
  if (!code) return null;
  const room = await db.room.findUnique({ where: { code } });
  if (!room) return null;
  if (isExpired(room)) {
    await db.room.delete({ where: { id: room.id } }).catch(() => {});
    return null;
  }
  return room;
}

/** Delete all expired rooms. Cheap enough to call opportunistically (e.g. on room creation). */
export async function sweepExpiredRooms(): Promise<void> {
  await db.room
    .deleteMany({ where: { lastActivityAt: { lt: new Date(Date.now() - ROOM_TTL_MS) } } })
    .catch(() => {});
}

export async function getPlayer(rawCode: string): Promise<{ room: Room; player: Player } | null> {
  const room = await getRoom(rawCode);
  if (!room) return null;
  const player = await getPlayerInRoom(room);
  return player ? { room, player } : null;
}

/**
 * The caller's player in an already-loaded room, or null. Identified by the room cookie, or failing
 * that by Google sign-in (same player on any device), in which case the cookie is re-issued.
 */
export async function getPlayerInRoom(room: Room): Promise<Player | null> {
  const jar = await cookies();
  const token = jar.get(cookieName(room.code))?.value;
  if (token) {
    const player = await db.player.findUnique({ where: { token } });
    if (player && player.roomId === room.id) return player;
  }
  const user = await getSessionUser();
  if (!user) return null;
  const player = await db.player.findUnique({ where: { roomId_userId: { roomId: room.id, userId: user.id } } });
  if (!player) return null;
  await setPlayerCookie(room.code, player.token);
  return player;
}

/** Mark room activity (extends the 48h expiry). Skips the write if touched within the last minute. */
export async function touchRoom(room: Pick<Room, "id" | "lastActivityAt">, force = false): Promise<void> {
  if (!force && Date.now() - room.lastActivityAt.getTime() < 60_000) return;
  await db.room.update({ where: { id: room.id }, data: { lastActivityAt: new Date() } }).catch(() => {});
}
