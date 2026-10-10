import "server-only";
import { randomInt } from "node:crypto";
import type { User } from "@prisma/client";
import { GAMES, getGame } from "@/lib/games";
import { db } from "./db";
import { formatCode, generateCodeBody, normalizeCodeInput, parseAdminEmails } from "./codes";

export function isAdmin(user: Pick<User, "email"> | null): boolean {
  if (!user?.email) return false;
  return parseAdminEmails(process.env.ACCOUNT_ADMIN).has(user.email.toLowerCase());
}

/** Game ids this user may host. Admins may host everything. */
export async function ownedGameIds(user: User): Promise<string[]> {
  if (isAdmin(user)) return GAMES.map((g) => g.id);
  const rows = await db.gamePurchase.findMany({ where: { userId: user.id }, select: { gameId: true } });
  return rows.map((r) => r.gameId);
}

export async function ownsGame(user: User, gameId: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  return Boolean(await db.gamePurchase.findUnique({ where: { userId_gameId: { userId: user.id, gameId } } }));
}

export interface CodeOptions {
  note: string | null;
  /** 1 for single-use; >1 or null (unlimited) for a group code. */
  maxUses: number | null;
  expiresAt: Date | null;
}

/** Create `count` codes for a game. Retries on the (astronomically unlikely) unique collision. */
export async function generateCodes(admin: User, gameId: string, count: number, opts: CodeOptions) {
  const created = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        created.push(
          await db.purchaseCode.create({
            data: {
              code: generateCodeBody(randomInt),
              gameId,
              note: opts.note,
              maxUses: opts.maxUses,
              expiresAt: opts.expiresAt,
              createdById: admin.id,
            },
          }),
        );
        break;
      } catch (err) {
        if ((err as { code?: string }).code !== "P2002") throw err;
      }
    }
  }
  return created;
}

export type RedeemResult =
  | { ok: true; gameId: string; alreadyOwned: boolean }
  /** `messageId` is an `api.redeem.*` message id; the route translates it for the caller. */
  | { ok: false; status: number; messageId: RedeemErrorId };

export type RedeemErrorId =
  | "api.redeem.badFormat"
  | "api.redeem.invalid"
  | "api.redeem.revoked"
  | "api.redeem.expired"
  | "api.redeem.used"
  | "api.redeem.noUsesLeft";

class CodeFull extends Error {}

/**
 * Redeem a code for the signed-in user. Each account can use a given code once; single-use codes
 * allow one account in total, group codes up to `maxUses` (or unlimited). A purchase is permanent.
 * If the user already owns the game, the code isn't used, so it stays available for someone else.
 */
export async function redeemCode(user: User, raw: unknown): Promise<RedeemResult> {
  const body = normalizeCodeInput(raw);
  if (!body) return { ok: false, status: 400, messageId: "api.redeem.badFormat" };
  const code = await db.purchaseCode.findUnique({ where: { code: body } });
  if (!code || !getGame(code.gameId)) return { ok: false, status: 404, messageId: "api.redeem.invalid" };

  const mine = await db.codeRedemption.findUnique({ where: { codeId_userId: { codeId: code.id, userId: user.id } } });
  if (mine) return { ok: true, gameId: code.gameId, alreadyOwned: true };
  if (code.revokedAt) return { ok: false, status: 410, messageId: "api.redeem.revoked" };
  if (code.expiresAt && code.expiresAt.getTime() <= Date.now()) return { ok: false, status: 410, messageId: "api.redeem.expired" };
  if (code.maxUses !== null && code.useCount >= code.maxUses) {
    return { ok: false, status: 409, messageId: code.maxUses === 1 ? "api.redeem.used" : "api.redeem.noUsesLeft" };
  }
  if (await ownsGame(user, code.gameId)) return { ok: true, gameId: code.gameId, alreadyOwned: true };

  try {
    await db.$transaction(async (tx) => {
      // The unique (codeId, userId) row stops one account from claiming twice...
      await tx.codeRedemption.create({ data: { codeId: code.id, userId: user.id } });
      // ...and this conditional increment stops concurrent claims from overshooting maxUses.
      const claimed = await tx.$executeRaw`
        UPDATE "PurchaseCode" SET "useCount" = "useCount" + 1
        WHERE "id" = ${code.id} AND "revokedAt" IS NULL
          AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
          AND ("maxUses" IS NULL OR "useCount" < "maxUses")`;
      if (claimed !== 1) throw new CodeFull();
      await tx.gamePurchase.upsert({
        where: { userId_gameId: { userId: user.id, gameId: code.gameId } },
        create: { userId: user.id, gameId: code.gameId, source: "code", sourceRef: code.id },
        update: {},
      });
    });
  } catch (err) {
    if (err instanceof CodeFull) return { ok: false, status: 409, messageId: "api.redeem.noUsesLeft" };
    if ((err as { code?: string }).code === "P2002") return { ok: true, gameId: code.gameId, alreadyOwned: true };
    throw err;
  }
  return { ok: true, gameId: code.gameId, alreadyOwned: false };
}

export { formatCode };
