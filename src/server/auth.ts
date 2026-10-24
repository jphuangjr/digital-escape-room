import "server-only";
import type { User } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { resolveUser, type SignInIdentity } from "./identity";

/** Providers send email_verified as a boolean (Google) or the string "true" (Apple). */
export function verifiedFlag(v: unknown): boolean {
  return v === true || v === "true";
}

/**
 * One sign-in provider: enabled when all its env vars are set. `profile` turns the provider's profile into the
 * fields `resolveUser` needs. Adding a provider (Apple, ...) is one entry here plus its env vars.
 */
interface ProviderDef {
  id: string;
  env: string[];
  create: () => Provider;
  profile: (profile: Record<string, unknown> | undefined) => Omit<SignInIdentity, "provider" | "providerAccountId">;
}

const str = (v: unknown) => (typeof v === "string" ? v : null);

const PROVIDERS: ProviderDef[] = [
  {
    id: "google",
    env: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
    create: () => GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! }),
    profile: (p) => ({
      email: str(p?.email),
      emailVerified: verifiedFlag(p?.email_verified),
      name: str(p?.given_name) || str(p?.name),
      image: str(p?.picture),
    }),
  },
];

const enabledDefs = PROVIDERS.filter((p) => p.env.every((name) => Boolean(process.env[name])));

/** Ids of the sign-in providers configured on this server ("google", ...). */
export const enabledProviders: string[] = enabledDefs.map((p) => p.id);

/** Sign-in is available (at least one provider configured); otherwise the app runs fully anonymous. */
export const authEnabled = enabledProviders.length > 0;

/** @deprecated Means "sign-in is enabled"; use `authEnabled`. Kept until the client stops reading it. */
export const googleEnabled = authEnabled;

const defFor = (provider: string | undefined) => enabledDefs.find((p) => p.id === provider);

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 90 * 24 * 60 * 60 },
  providers: enabledDefs.map((p) => p.create()),
  callbacks: {
    async signIn({ account }) {
      return Boolean(defFor(account?.provider) && account?.providerAccountId);
    },
    async jwt({ token, account, profile }) {
      // First sign-in: find or create our User for this identity. The token only ever carries our user id.
      const def = defFor(account?.provider);
      if (def && account?.providerAccountId) {
        const user = await resolveUser({
          provider: def.id,
          providerAccountId: account.providerAccountId,
          ...def.profile(profile as Record<string, unknown> | undefined),
        });
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") (session.user as { id?: string }).id = token.uid;
      return session;
    },
  },
};

/** The signed-in User row, or null for anonymous visitors. */
export async function getSessionUser(): Promise<User | null> {
  if (!authEnabled) return null;
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}
