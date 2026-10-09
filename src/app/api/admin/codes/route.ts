import type { Prisma } from "@prisma/client";
import type { AdminCodeDTO } from "@/lib/types";
import { db } from "@/server/db";
import { error, isResponse, json, readBody } from "@/server/http";
import { requireAdmin } from "@/server/admin";
import { formatCode, generateCodes } from "@/server/purchases";
import { getGame } from "@/lib/games";

const WITH_REDEMPTIONS = {
  redemptions: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 },
} satisfies Prisma.PurchaseCodeInclude;
type CodeRow = Prisma.PurchaseCodeGetPayload<{ include: typeof WITH_REDEMPTIONS }>;

function dto(c: CodeRow, now = Date.now()): AdminCodeDTO {
  const status: AdminCodeDTO["status"] = c.revokedAt
    ? "revoked"
    : c.expiresAt && c.expiresAt.getTime() <= now
      ? "expired"
      : c.maxUses !== null && c.useCount >= c.maxUses
        ? "used"
        : "active";
  return {
    id: c.id,
    code: formatCode(c.code),
    gameId: c.gameId,
    note: c.note,
    maxUses: c.maxUses,
    useCount: c.useCount,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    revokedAt: c.revokedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    status,
    redemptions: c.redemptions.map((r) => ({ email: r.user.email ?? r.user.name ?? "unknown", at: r.createdAt.toISOString() })),
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
    include: WITH_REDEMPTIONS,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return json({ codes: rows.map((r) => dto(r)) });
}

/**
 * POST {gameId, kind: "single"|"group", count?, maxUses?, expiresInDays?, note?}
 * - single: `count` (1–50) codes, one account each.
 * - group: one shareable code; `maxUses` 2–10000 or null for unlimited; once per account.
 */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (isResponse(admin)) return admin;
  const body = await readBody(req);
  const gameId = typeof body?.gameId === "string" ? body.gameId : "";
  if (!getGame(gameId)) return error(400, "Unknown game.");
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim().slice(0, 120) : null;

  const days = body?.expiresInDays == null ? null : Number(body.expiresInDays);
  if (days !== null && (!Number.isInteger(days) || days < 1 || days > 365)) return error(400, "Expiry must be 1–365 days.");
  const expiresAt = days === null ? null : new Date(Date.now() + days * 86_400_000);

  let count = 1;
  let maxUses: number | null = 1;
  if (body?.kind === "group") {
    maxUses = body.maxUses == null ? null : Number(body.maxUses);
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 2 || maxUses > 10_000)) {
      return error(400, "A group code allows 2–10000 uses, or unlimited.");
    }
  } else {
    count = Number(body?.count);
    if (!Number.isInteger(count) || count < 1 || count > 50) return error(400, "Count must be 1–50.");
  }

  const created = await generateCodes(admin, gameId, count, { note, maxUses, expiresAt });
  return json({ codes: created.map((c) => dto({ ...c, redemptions: [] })) }, 201);
}
