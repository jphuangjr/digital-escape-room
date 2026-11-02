import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// Deletes real rows, so it runs only against a scratch database:
//   ACCOUNT_DELETE_DB_TEST=1 POSTGRES_PRISMA_URL=<scratch db> npx vitest run src/server/__tests__/accountDeletion.test.ts
describe.skipIf(!process.env.ACCOUNT_DELETE_DB_TEST)("deleteAccount against Postgres", async () => {
  const { db } = await import("../db");
  const { deleteAccount } = await import("../accountDeletion");
  const tag = `del${Date.now()}`;
  afterAll(async () => {
    await db.room.deleteMany({ where: { code: { startsWith: "DEL-" } } });
    await db.user.deleteMany({ where: { email: { contains: tag } } });
    await db.$disconnect();
  });

  it("removes the account and what's tied to it, keeps rooms playable and admin codes working", async () => {
    const email = `${tag}@example.com`;
    const user = await db.user.create({
      data: {
        email,
        emailVerified: true,
        identities: { create: { provider: "email", providerAccountId: email, email, emailVerified: true } },
        purchases: { create: { gameId: "nightingale-express", source: "code" } },
      },
    });
    const other = await db.user.create({ data: { email: `other-${tag}@example.com` } });
    await db.userBlock.create({ data: { blockerUserId: other.id, blockedUserId: user.id } });
    const code = await db.purchaseCode.create({ data: { code: `DEL${Date.now()}`, gameId: "nightingale-express", createdById: user.id } });
    await db.emailCode.create({ data: { email, codeHash: "x", expiresAt: new Date(Date.now() + 60_000) } });
    const room = await db.room.create({ data: { code: `DEL-${Date.now().toString(36).slice(-4).toUpperCase()}`, gameId: "ada-voss", progress: {} } });
    const player = await db.player.create({ data: { roomId: room.id, token: `t-${tag}`, displayName: "Lee", color: "#fff", userId: user.id, image: "https://x/p.png" } });

    expect(await deleteAccount(user.id)).toBe(true);

    expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull();
    expect(await db.authIdentity.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.gamePurchase.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.userBlock.count({ where: { blockedUserId: user.id } })).toBe(0);
    expect(await db.emailCode.count({ where: { email } })).toBe(0);
    expect(await db.player.findUnique({ where: { id: player.id } })).toMatchObject({ displayName: "Lee", userId: null, image: null });
    expect(await db.purchaseCode.findUnique({ where: { id: code.id } })).toMatchObject({ createdById: null });
    expect(await deleteAccount(user.id)).toBe(false);
  });
});
