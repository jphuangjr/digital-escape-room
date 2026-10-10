import type { Prisma } from "@prisma/client";
import type { NoteDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { isFragmentTag } from "@/server/logic";
import { publish } from "@/server/realtime";
import { touchRoom } from "@/server/session";
import { noteDTO } from "@/server/state";
import { getT } from "@/i18n/server";

const MAX_NOTE_LEN = 2000;
type Params = { params: Promise<{ code: string; id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { code, id } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const t = await getT();
  const note = await db.note.findUnique({ where: { id } });
  // Don't reveal existence of other players' private notes.
  if (!note || note.roomId !== room.id || (note.visibility !== "PUBLIC" && note.authorId !== player.id)) {
    return error(404, t("api.notes.notFound"));
  }
  if (note.authorId !== player.id) return error(403, t("api.notes.authorOnlyEdit"));

  const body = await readBody(req);
  if (!body) return error(400, t("api.common.invalidJson"));
  const data: Prisma.NoteUpdateInput = {};
  if (body.body !== undefined) {
    const text = typeof body.body === "string" ? body.body.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim() : "";
    if (!text) return error(400, t("api.notes.empty"));
    if (text.length > MAX_NOTE_LEN) return error(400, t("api.notes.tooLong", { max: MAX_NOTE_LEN }));
    data.body = text;
  }
  if (body.visibility !== undefined) {
    if (body.visibility !== "PUBLIC" && body.visibility !== "PRIVATE") return error(400, t("api.notes.badVisibility"));
    data.visibility = body.visibility;
  }
  if (body.fragmentTag !== undefined) {
    if (body.fragmentTag !== null && !isFragmentTag(body.fragmentTag)) return error(400, t("api.notes.unknownTag"));
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
  const t = await getT();
  const note = await db.note.findUnique({ where: { id } });
  if (!note || note.roomId !== room.id || (note.visibility !== "PUBLIC" && note.authorId !== player.id)) {
    return error(404, t("api.notes.notFound"));
  }
  const isAuthor = note.authorId === player.id;
  const isHost = room.hostId === player.id;
  if (!isAuthor && !(isHost && note.visibility === "PUBLIC")) {
    return error(403, t("api.notes.authorOrHostDelete"));
  }
  await db.note.delete({ where: { id } }).catch(() => {});
  await touchRoom(room);
  if (note.visibility === "PUBLIC") await publish(room.code, "note.public.deleted", { id });
  return json({ ok: true });
}
