import "server-only";
import type { Prisma, User } from "@prisma/client";
import { db } from "./db";

/** What a sign-in provider tells us about the person signing in, normalised by the provider's definition. */
export interface SignInIdentity {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  emailVerified?: boolean;
  name?: string | null;
  image?: string | null;
}

type Tx = Pick<Prisma.TransactionClient, "authIdentity" | "user">;

/** The slice of the Prisma client `resolveUser` needs (a fake in tests). */
export interface IdentityStore {
  $transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  authIdentity: Pick<Tx["authIdentity"], "findUnique">;
}

const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null);

const isUniqueViolation = (err: unknown) => (err as { code?: string } | null)?.code === "P2002";

/**
 * The User behind a sign-in, creating or linking as needed:
 *   a. a known identity (provider + account id) → its user, refreshing email/name/picture;
 *   b. otherwise a verified email that exactly one user already has on a verified identity → link to that user
 *      (a Google user who later signs in with Apple keeps their purchases);
 *   c. otherwise a new User with this identity.
 * Google sign-ins also match a legacy User.googleSub with no identity row yet (users the previous code created
 * during the rollout), and new Google users still get googleSub so that code keeps working until it's gone.
 * Two sign-ins creating the same identity at once: the loser's transaction fails on the unique index and
 * re-reads the winner's.
 */
export async function resolveUser(input: SignInIdentity, store: IdentityStore = db as unknown as IdentityStore): Promise<User> {
  try {
    return await store.$transaction((tx) => resolveIn(tx, input));
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    const found = await store.authIdentity.findUnique({
      where: { provider_providerAccountId: { provider: input.provider, providerAccountId: input.providerAccountId } },
      include: { user: true },
    });
    if (found) return found.user;
    throw err;
  }
}

async function resolveIn(tx: Tx, input: SignInIdentity): Promise<User> {
  const { provider, providerAccountId } = input;
  const email = clean(input.email);
  const verified = Boolean(email && input.emailVerified);
  const name = clean(input.name);
  const image = clean(input.image);
  // Profile updates for an existing user: never blank out a name or picture (some providers send none), and
  // never let an unverified email replace one we have (it only fills a gap).
  const refresh = (user: Pick<User, "email">) => ({
    ...(name ? { name } : {}),
    ...(image ? { image } : {}),
    ...(email && (verified || !user.email) ? { email, emailVerified: verified } : {}),
  });
  const identity = { provider, providerAccountId, email, emailVerified: verified };

  // a. This account has signed in before.
  const known = await tx.authIdentity.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });
  if (known) {
    if (email) await tx.authIdentity.update({ where: { id: known.id }, data: { email, emailVerified: verified } });
    return tx.user.update({ where: { id: known.userId }, data: refresh(known.user) });
  }

  // a'. A Google user from before identities existed, or created by the previous code during the rollout.
  const legacy = provider === "google" ? await tx.user.findUnique({ where: { googleSub: providerAccountId } }) : null;
  // b. A verified email that exactly one user has on a verified identity.
  const target = legacy ?? (verified ? await linkableUser(tx, email!) : null);
  if (target) {
    await tx.authIdentity.create({ data: { ...identity, userId: target.id } });
    return tx.user.update({ where: { id: target.id }, data: refresh(target) });
  }

  // c. Someone new.
  return tx.user.create({
    data: {
      googleSub: provider === "google" ? providerAccountId : null,
      email,
      emailVerified: verified,
      name,
      image,
      identities: { create: identity },
    },
  });
}

async function linkableUser(tx: Tx, email: string): Promise<User | null> {
  const matches = await tx.authIdentity.findMany({
    where: { emailVerified: true, email: { equals: email, mode: "insensitive" } },
    select: { userId: true },
  });
  const users = new Set(matches.map((m) => m.userId));
  if (users.size !== 1) return null; // none, or ambiguous: never guess between two accounts
  return tx.user.findUnique({ where: { id: [...users][0] } });
}

/** The providers a user has signed in with ("google", ...), oldest first. */
export async function userProviders(userId: string): Promise<string[]> {
  const rows = await db.authIdentity.findMany({ where: { userId }, select: { provider: true }, orderBy: { createdAt: "asc" } });
  return [...new Set(rows.map((r) => r.provider))];
}
