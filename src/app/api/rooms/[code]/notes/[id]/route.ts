import type { Prisma } from "@prisma/client";
import type { NoteDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { isFragmentTag } from "@/server/logic";
import { publish } from "@/server/realtime";
import { touchRoom } from "@/server/session";
import { noteDTO } from "@/server/state";

const MAX_NOTE_LEN = 2000;
type Params = { params: Promise<{ code: string; id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { code, id } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const note = await db.note.findUnique({ where: { id } });
  // Don't reveal existence of other players' private notes.
  if (!note || note.roomId !== room.id || (note.visibility !== "PUBLIC" && note.authorId !== player.id)) {
    return error(404, "Note not found.");
  }
  if (note.authorId !== player.id) return error(403, "Only the author can edit this note.");

  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");
  const data: Prisma.NoteUpdateInput = {};
  if (body.body !== undefined) {
    const text = typeof body.body === "string" ? body.body.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim() : "";
    if (!text) return error(400, "Note is empty.");
    if (text.length > MAX_NOTE_LEN) return error(400, `Notes are limited to ${MAX_NOTE_LEN} characters.`);
    data.body = text;
  }
  if (body.visibility !== undefined) {
    if (body.visibility !== "PUBLIC" && body.visibility !== "PRIVATE") return error(400, "visibility must be PRIVATE or PUBLIC.");
    data.visibility = body.visibility;
  }
  if (body.fragmentTag !== undefined) {
    if (body.fragmentTag !== null && !isFragmentTag(body.fragmentTag)) return error(400, "Unknown fragment tag.");
    data.fragmentTag = body.fragmentTag;
  }

  const updated = await db.note.update({ where: { id }, data });
  await touchRoom(room);
  const was = note.visibility === "PUBLIC";
  const now = updated.visibility === "PUBLIC";
  if (was && now) await publish(room.code, "note.public.updated", { id });
  else if (!was && now) await publish(room.code, "note.public.created", { id });
  else if (was && !now) await publish(room.code, "note.public.deleted", { id });
  return json<NoteDTO>(noteDTO(updated, player));
}

export async function DELETE(_req: Request, { params }: Params) {
  const { code, id } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const note = await db.note.findUnique({ where: { id } });
  if (!note || note.roomId !== room.id || (note.visibility !== "PUBLIC" && note.authorId !== player.id)) {
    return error(404, "Note not found.");
  }
  const isAuthor = note.authorId === player.id;
  const isHost = room.hostId === player.id;
  if (!isAuthor && !(isHost && note.visibility === "PUBLIC")) {
    return error(403, "Only the author or the host can delete this note.");
  }
  await db.note.delete({ where: { id } }).catch(() => {});
  await touchRoom(room);
  if (note.visibility === "PUBLIC") await publish(room.code, "note.public.deleted", { id });
  return json({ ok: true });
}
