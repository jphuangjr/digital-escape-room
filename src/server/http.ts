import "server-only";
import { NextResponse } from "next/server";
import type { Player, Room } from "@prisma/client";
import { getPlayerInRoom, getRoom } from "./session";

export function json<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function error(status: number, message: string, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, status);
}

/** Parse a JSON object body; returns null if missing/invalid/not an object. */
export async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const v = await req.json();
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export type Ctx = { room: Room; player: Player };

/** Resolve the caller's room+player from the cookie, or return a 404/401 response. */
export async function requirePlayer(code: string): Promise<Ctx | Response> {
  const room = await getRoom(code);
  if (!room) return error(404, "Room not found or expired.");
  const player = await getPlayerInRoom(room);
  if (!player) return error(401, "You are not a member of this room.");
  return { room, player };
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}
