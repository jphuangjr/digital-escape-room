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

/** Create `count` unused codes for a game. Retries on the (astronomically unlikely) unique collision. */
export async function generateCodes(admin: User, gameId: string, count: number, note: string | null) {
  const created = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        created.push(
          await db.purchaseCode.create({
            data: { code: generateCodeBody(randomInt), gameId, note, createdById: admin.id },
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
  | { ok: false; status: number; error: string };

/**
 * Redeem a code for the signed-in user. Single use; a purchase is permanent. If the user already owns
 * the game, the code is left unused so it can go to someone else.
 */
export async function redeemCode(user: User, raw: unknown): Promise<RedeemResult> {
  const body = normalizeCodeInput(raw);
  if (!body) return { ok: false, status: 400, error: "That doesn't look like a purchase code (KEY-XXXX-XXXX-XXXX)." };
  const code = await db.purchaseCode.findUnique({ where: { code: body } });
  if (!code || !getGame(code.gameId)) return { ok: false, status: 404, error: "That code isn't valid." };
  if (code.redeemedById === user.id) return { ok: true, gameId: code.gameId, alreadyOwned: true };
  if (code.redeemedById) return { ok: false, status: 409, error: "That code has already been used." };
  if (await ownsGame(user, code.gameId)) return { ok: true, gameId: code.gameId, alreadyOwned: true };

  return db.$transaction(async (tx) => {
    const claimed = await tx.purchaseCode.updateMany({
      where: { id: code.id, redeemedById: null },
      data: { redeemedById: user.id, redeemedAt: new Date() },
    });
    if (claimed.count !== 1) return { ok: false as const, status: 409, error: "That code has already been used." };
    await tx.gamePurchase.upsert({
      where: { userId_gameId: { userId: user.id, gameId: code.gameId } },
      create: { userId: user.id, gameId: code.gameId, source: "code", sourceRef: code.id },
      update: {},
    });
    return { ok: true as const, gameId: code.gameId, alreadyOwned: false };
  });
}

export { formatCode };
