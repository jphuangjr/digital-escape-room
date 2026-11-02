import "server-only";
import { db } from "./db";

/**
 * Delete a User for good. Cascades take their sign-in methods (identities, passkeys), unlocked games, codes they
 * redeemed, case history and blocks. Rooms they're in keep their player (name and color) so a game in progress
 * isn't broken, but the player is detached from the account and loses the profile photo. Codes they made as an
 * admin keep working; reports they filed or were named in stay for review without the account link.
 */
export async function deleteAccount(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId }, include: { identities: { select: { email: true } } } });
  if (!user) return false;
  const emails = [...new Set([user.email, ...user.identities.map((i) => i.email)].filter((e): e is string => !!e).map((e) => e.toLowerCase()))];
  await db.$transaction([
    db.player.updateMany({ where: { userId }, data: { userId: null, image: null } }),
    db.authChallenge.deleteMany({ where: { userId } }),
    db.emailCode.deleteMany({ where: { email: { in: emails } } }),
    db.user.delete({ where: { id: userId } }),
  ]);
  return true;
}
