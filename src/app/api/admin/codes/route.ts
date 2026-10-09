import type { AdminCodeDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { formatCode, generateCodes } from "@/server/purchases";
import { getGame } from "@/lib/games";

type CodeRow = Awaited<ReturnType<typeof db.purchaseCode.findMany<{ include: { redeemedBy: true } }>>>[number];

function dto(c: CodeRow | (Omit<CodeRow, "redeemedBy"> & { redeemedBy?: null })): AdminCodeDTO {
  return {
    id: c.id,
    code: formatCode(c.code),
    gameId: c.gameId,
    note: c.note,
    createdAt: c.createdAt.toISOString(),
    redeemedAt: c.redeemedAt?.toISOString() ?? null,
    redeemedBy: c.redeemedBy ? (c.redeemedBy.email ?? c.redeemedBy.name ?? "unknown") : null,
  };
}

/** GET ?gameId= → that game's codes, newest first. */
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const gameId = new URL(req.url).searchParams.get("gameId") ?? "";
  if (!getGame(gameId)) return error(400, "Unknown game.");
  const rows = await db.purchaseCode.findMany({
    where: { gameId },
    include: { redeemedBy: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return json({ codes: rows.map(dto) });
}

/** POST {gameId, count (1–50), note?} → newly generated codes. */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await readBody(req);
  const gameId = typeof body?.gameId === "string" ? body.gameId : "";
  if (!getGame(gameId)) return error(400, "Unknown game.");
  const count = Number(body?.count);
  if (!Number.isInteger(count) || count < 1 || count > 50) return error(400, "Count must be 1–50.");
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim().slice(0, 120) : null;
  const created = await generateCodes(admin, gameId, count, note);
  return json({ codes: created.map((c) => dto({ ...c, redeemedBy: null })) }, 201);
}
