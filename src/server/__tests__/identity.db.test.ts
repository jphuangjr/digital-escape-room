import { afterAll, describe, expect, it } from "vitest";

// Runs resolveUser and the next-auth callbacks against a real, migrated Postgres. Opt-in, because it writes rows:
//   IDENTITY_DB_TEST=1 POSTGRES_PRISMA_URL=<a scratch copy> npx vitest run src/server/__tests__/identity.db.test.ts
const enabled = Boolean(process.env.IDENTITY_DB_TEST);

describe.skipIf(!enabled)("resolveUser against Postgres", async () => {
  process.env.AUTH_GOOGLE_ID ||= "test-client";
  process.env.AUTH_GOOGLE_SECRET ||= "test-secret";
  const { db } = await import("../db");
  const { resolveUser } = await import("../identity");
  const { authOptions } = await import("../auth");
  const run = `t${Date.now()}`;
  const made: string[] = [];
  const jwt = (provider: string, providerAccountId: string, profile: Record<string, unknown>) =>
    authOptions.callbacks!.jwt!({ token: {}, account: { provider, providerAccountId, type: "oauth" }, profile } as never);

  afterAll(async () => {
    await db.user.deleteMany({ where: { id: { in: made } } });
    await db.$disconnect();
  });

  it("signs a backfilled Google user back in through the jwt callback, unchanged", async () => {
    const before = await db.user.findFirst({ where: { googleSub: { not: null }, identities: { some: { provider: "google" } } }, include: { identities: true } });
    expect(before).toBeTruthy();
    const token = await jwt("google", before!.googleSub!, { email: before!.email, email_verified: true, given_name: "", picture: "" });
    expect(token.uid).toBe(before!.id);
    const after = await db.user.findUnique({ where: { id: before!.id }, include: { identities: true } });
    expect(after!.identities).toHaveLength(before!.identities.length);
    expect(after).toMatchObject({ name: before!.name, image: before!.image, email: before!.email });
  });

  it("creates a new Google user with an identity and googleSub, then links another provider by verified email", async () => {
    const email = `${run}@Example.com`;
    const token = await jwt("google", `${run}-g`, { email, email_verified: true, given_name: "Robin", picture: "p.png" });
    made.push(token.uid as string);
    const u = await db.user.findUnique({ where: { id: token.uid as string }, include: { identities: true } });
    expect(u).toMatchObject({ googleSub: `${run}-g`, email, emailVerified: true, name: "Robin" });
    expect(u!.identities).toMatchObject([{ provider: "google", providerAccountId: `${run}-g`, emailVerified: true }]);

    // A second provider (Apple sends email_verified as a string) with the same email in another case.
    const linked = await resolveUser({ provider: "apple", providerAccountId: `${run}-a`, email: email.toUpperCase(), emailVerified: true });
    expect(linked.id).toBe(u!.id);
    expect(await db.authIdentity.count({ where: { userId: u!.id } })).toBe(2);
  });

  it("keeps an unverified email off existing accounts", async () => {
    const email = `${run}@example.com`;
    const other = await resolveUser({ provider: "apple", providerAccountId: `${run}-x`, email, emailVerified: false });
    made.push(other.id);
    expect(other.emailVerified).toBe(false);
    expect(await db.authIdentity.count({ where: { userId: other.id } })).toBe(1);
  });

  it("settles two simultaneous first sign-ins on one user", async () => {
    const id = `${run}-race`;
    const [a, b] = await Promise.all([
      resolveUser({ provider: "google", providerAccountId: id, email: `${run}-race@example.com`, emailVerified: true }),
      resolveUser({ provider: "google", providerAccountId: id, email: `${run}-race@example.com`, emailVerified: true }),
    ]);
    made.push(a.id);
    expect(b.id).toBe(a.id);
    expect(await db.user.count({ where: { googleSub: id } })).toBe(1);
    expect(await db.authIdentity.count({ where: { providerAccountId: id } })).toBe(1);
  });

  it("refuses a provider that isn't enabled", async () => {
    const ok = await authOptions.callbacks!.signIn!({ account: { provider: "github", providerAccountId: "1", type: "oauth" } } as never);
    expect(ok).toBe(false);
    const google = await authOptions.callbacks!.signIn!({ account: { provider: "google", providerAccountId: "1", type: "oauth" } } as never);
    expect(google).toBe(true);
  });
});
