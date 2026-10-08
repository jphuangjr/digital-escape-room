import type { NoteDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody, requirePlayer } from "@/server/http";
import { isFragmentTag } from "@/server/logic";
import { publish } from "@/server/realtime";
import { touchRoom } from "@/server/session";
import { noteDTO } from "@/server/state";

const MAX_NOTE_LEN = 2000;
const MAX_NOTES_PER_PLAYER = 200;

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ctx = await requirePlayer(code);
  if (isResponse(ctx)) return ctx;
  const { room, player } = ctx;
  const body = await readBody(req);
  if (!body) return error(400, "Invalid JSON body.");

  const text = typeof body.body === "string" ? body.body.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim() : "";
  if (!text) return error(400, "Note is empty.");
  if (text.length > MAX_NOTE_LEN) return error(400, `Notes are limited to ${MAX_NOTE_LEN} characters.`);
  const visibility = body.visibility === "PUBLIC" ? "PUBLIC" : body.visibility === "PRIVATE" || body.visibility === undefined ? "PRIVATE" : null;
  if (!visibility) return error(400, "visibility must be PRIVATE or PUBLIC.");
  if (body.fragmentTag != null && !isFragmentTag(body.fragmentTag)) return error(400, "Unknown fragment tag.");
  const fragmentTag = isFragmentTag(body.fragmentTag) ? body.fragmentTag : null;

  const count = await db.note.count({ where: { roomId: room.id, authorId: player.id } });
  if (count >= MAX_NOTES_PER_PLAYER) return error(409, "Note limit reached; delete some notes first.");

  const note = await db.note.create({
    data: { roomId: room.id, authorId: player.id, visibility, body: text, fragmentTag },
  });
  await touchRoom(room);
  const dto = noteDTO(note, player);
  if (visibility === "PUBLIC") await publish(room.code, "note.public.created", { id: note.id });
  return json<NoteDTO>(dto, 201);
}
