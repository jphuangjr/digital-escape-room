import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({ db: {} }));

import { resolveUser, type IdentityStore, type SignInIdentity } from "../identity";
import { isAdmin } from "../purchases";
import { verifiedFlag } from "../auth";

type U = { id: string; googleSub: string | null; email: string | null; emailVerified: boolean; name: string | null; image: string | null; createdAt: Date };
type I = { id: string; userId: string; provider: string; providerAccountId: string; email: string | null; emailVerified: boolean; createdAt: Date };

type Where = {
  id?: string;
  googleSub?: string;
  provider_providerAccountId?: { provider: string; providerAccountId: string };
  emailVerified?: boolean;
  email?: { equals: string };
};
type Args = { where?: Where; data?: Record<string, unknown>; include?: { user?: boolean } };

const unique = () => Object.assign(new Error("Unique constraint failed"), { code: "P2002" });

/** An in-memory stand-in for the Prisma calls resolveUser makes, with the same unique constraints. */
function fakeStore(seed: { users?: U[]; identities?: I[] } = {}) {
  const users: U[] = [...(seed.users ?? [])];
  const identities: I[] = [...(seed.identities ?? [])];
  let n = 0;
  const id = (p: string) => `${p}${++n}`;
  const addIdentity = (data: Omit<I, "id" | "createdAt">) => {
    if (identities.some((i) => i.provider === data.provider && i.providerAccountId === data.providerAccountId)) throw unique();
    const row = { ...data, id: id("i"), createdAt: new Date() };
    identities.push(row);
    return row;
  };
  const tx = {
    authIdentity: {
      findUnique: async ({ where, include }: Args) => {
        const k = where!.provider_providerAccountId!;
        const row = identities.find((i) => i.provider === k.provider && i.providerAccountId === k.providerAccountId);
        return row ? { ...row, ...(include?.user ? { user: users.find((u) => u.id === row.userId)! } : {}) } : null;
      },
      findMany: async ({ where }: Args) =>
        identities
          .filter((i) => i.emailVerified === where!.emailVerified && i.email?.toLowerCase() === where!.email!.equals.toLowerCase())
          .map((i) => ({ userId: i.userId })),
      create: async ({ data }: Args) => addIdentity(data as Omit<I, "id" | "createdAt">),
      update: async ({ where, data }: Args) => Object.assign(identities.find((i) => i.id === where!.id)!, data),
    },
    user: {
      findUnique: async ({ where }: Args) =>
        users.find((u) => (where!.id ? u.id === where!.id : where!.googleSub != null && u.googleSub === where!.googleSub)) ?? null,
      update: async ({ where, data }: Args) => Object.assign(users.find((u) => u.id === where!.id)!, data),
      create: async ({ data }: Args) => {
        const { identities: nested, ...rest } = data as { identities: { create: Omit<I, "id" | "createdAt" | "userId"> } } & Partial<U>;
        if (rest.googleSub && users.some((u) => u.googleSub === rest.googleSub)) throw unique();
        const user = { ...rest, id: id("u"), createdAt: new Date() } as U;
        users.push(user);
        addIdentity({ ...nested.create, userId: user.id });
        return user;
      },
    },
  };
  const store = { $transaction: (fn: (t: typeof tx) => Promise<unknown>) => fn(tx), authIdentity: tx.authIdentity } as unknown as IdentityStore;
  return { store, users, identities, tx };
}

const user = (over: Partial<U> = {}): U => ({ id: "u-old", googleSub: "g-123", email: "sam@example.com", emailVerified: true, name: "Sam", image: "pic.png", createdAt: new Date(0), ...over });
const ident = (over: Partial<I> = {}): I => ({ id: "i-old", userId: "u-old", provider: "google", providerAccountId: "g-123", email: "sam@example.com", emailVerified: true, createdAt: new Date(0), ...over });
const google = (over: Partial<SignInIdentity> = {}): SignInIdentity => ({ provider: "google", providerAccountId: "g-123", email: "sam@example.com", emailVerified: true, name: "Sam", image: "pic.png", ...over });

describe("resolveUser", () => {
  it("signs an existing Google user back in to the same user", async () => {
    const f = fakeStore({ users: [user()], identities: [ident()] });
    const u = await resolveUser(google({ name: "Samantha" }), f.store);
    expect(u.id).toBe("u-old");
    expect(f.users).toHaveLength(1);
    expect(f.identities).toHaveLength(1);
    expect(f.users[0].name).toBe("Samantha");
  });

  it("links a new provider with the same verified email to the existing user", async () => {
    const f = fakeStore({ users: [user()], identities: [ident()] });
    const u = await resolveUser({ provider: "apple", providerAccountId: "a-9", email: "SAM@example.com", emailVerified: true }, f.store);
    expect(u.id).toBe("u-old");
    expect(f.users).toHaveLength(1);
    expect(f.identities.map((i) => [i.provider, i.userId])).toEqual([
      ["google", "u-old"],
      ["apple", "u-old"],
    ]);
  });

  it("makes a separate user when the same email arrives unverified", async () => {
    const f = fakeStore({ users: [user()], identities: [ident()] });
    const u = await resolveUser({ provider: "apple", providerAccountId: "a-9", email: "sam@example.com", emailVerified: false }, f.store);
    expect(u.id).not.toBe("u-old");
    expect(f.users).toHaveLength(2);
    expect(u.emailVerified).toBe(false);
    expect(u.googleSub).toBeNull();
  });

  it("never auto-links when two users share a verified email", async () => {
    const f = fakeStore({
      users: [user(), user({ id: "u-two", googleSub: "g-456" })],
      identities: [ident(), ident({ id: "i-two", userId: "u-two", providerAccountId: "g-456" })],
    });
    const u = await resolveUser({ provider: "apple", providerAccountId: "a-9", email: "sam@example.com", emailVerified: true }, f.store);
    expect(["u-old", "u-two"]).not.toContain(u.id);
    expect(f.users).toHaveLength(3);
  });

  it("doesn't overwrite a stored name or picture with empty ones", async () => {
    const f = fakeStore({ users: [user()], identities: [ident()] });
    await resolveUser({ provider: "google", providerAccountId: "g-123", email: "sam@example.com", emailVerified: true, name: "", image: "  " }, f.store);
    expect(f.users[0]).toMatchObject({ name: "Sam", image: "pic.png" });
    // Linking a provider that sends no name or picture keeps them too.
    await resolveUser({ provider: "apple", providerAccountId: "a-9", email: "sam@example.com", emailVerified: true, name: null, image: null }, f.store);
    expect(f.users[0]).toMatchObject({ name: "Sam", image: "pic.png" });
  });

  it("creates a new Google user with googleSub set, for the code still deployed", async () => {
    const f = fakeStore();
    const u = await resolveUser(google({ providerAccountId: "g-new", email: "new@example.com" }), f.store);
    expect(u).toMatchObject({ googleSub: "g-new", email: "new@example.com", emailVerified: true });
    expect(f.identities).toMatchObject([{ provider: "google", providerAccountId: "g-new", userId: u.id, emailVerified: true }]);
  });

  it("attaches an identity to a legacy Google user that has none yet", async () => {
    const f = fakeStore({ users: [user()] });
    const u = await resolveUser(google(), f.store);
    expect(u.id).toBe("u-old");
    expect(f.users).toHaveLength(1);
    expect(f.identities).toMatchObject([{ provider: "google", providerAccountId: "g-123", userId: "u-old" }]);
  });

  it("keeps a verified email when a later sign-in brings an unverified one", async () => {
    const f = fakeStore({ users: [user()], identities: [ident()] });
    await resolveUser(google({ email: "other@example.com", emailVerified: false }), f.store);
    expect(f.users[0]).toMatchObject({ email: "sam@example.com", emailVerified: true });
  });

  it("re-reads the winner when two sign-ins create the same identity at once", async () => {
    const f = fakeStore();
    // The other sign-in commits first, between our lookup and our insert.
    const create = f.tx.user.create;
    f.tx.user.create = async (args: Args) => {
      await create({ data: { ...args.data } });
      return create(args);
    };
    const u = await resolveUser(google({ providerAccountId: "g-race", email: "race@example.com" }), f.store);
    expect(f.users).toHaveLength(1);
    expect(u.id).toBe(f.users[0].id);
  });
});

describe("verifiedFlag", () => {
  it("accepts Google's boolean and Apple's string", () => {
    expect(verifiedFlag(true)).toBe(true);
    expect(verifiedFlag("true")).toBe(true);
    expect(verifiedFlag(false)).toBe(false);
    expect(verifiedFlag("false")).toBe(false);
    expect(verifiedFlag(undefined)).toBe(false);
  });
});

describe("isAdmin", () => {
  let saved: string | undefined;
  beforeEach(() => {
    saved = process.env.ACCOUNT_ADMIN;
    process.env.ACCOUNT_ADMIN = "owner@example.com";
  });
  afterEach(() => {
    process.env.ACCOUNT_ADMIN = saved;
  });

  it("only trusts a verified email on the admin list", () => {
    expect(isAdmin({ email: "Owner@example.com", emailVerified: true })).toBe(true);
    expect(isAdmin({ email: "owner@example.com", emailVerified: false })).toBe(false);
    expect(isAdmin({ email: "someone@example.com", emailVerified: true })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
