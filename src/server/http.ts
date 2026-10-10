import "server-only";
import { NextResponse } from "next/server";
import type { Player, Room } from "@prisma/client";
import { getT } from "@/i18n/server";
import { getPlayerInRoom, getRoom } from "./session";
import { CHAT_MAX_LEN } from "./logic";

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
  if (!room) return error(404, (await getT())("api.room.notFound"));
  const player = await getPlayerInRoom(room);
  if (!player) return error(401, (await getT())("api.room.notMember"));
  return { room, player };
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}

type T = Awaited<ReturnType<typeof getT>>;

/**
 * Translate an English error from the pure logic helpers (validateDisplayName, cleanChatBody) at the
 * route boundary. Unknown messages pass through unchanged.
 */
export function translateLogicError(t: T, message: string): string {
  switch (message) {
    case "Display name is required.":
      return t("api.player.nameRequired");
    case "Display name must be 24 characters or fewer.":
      return t("api.player.nameTooLong", { max: 24 });
    case "Please choose a different display name.":
      return t("api.player.nameRejected");
    case "Message is empty.":
      return t("api.chat.empty");
    case `Messages can be up to ${CHAT_MAX_LEN} characters.`:
      return t("api.chat.tooLong", { max: CHAT_MAX_LEN });
    default:
      return message;
  }
}
