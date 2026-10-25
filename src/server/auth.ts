import "server-only";
import type { User } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { db } from "./db";
import { resolveUser, type SignInIdentity } from "./identity";
import { emailEnabled } from "./email";
import { normalizeEmail, verifyCode } from "./emailCode";
import { finishLogin, relyingParty } from "./passkeys";

/** Providers send email_verified as a boolean (Google) or the string "true" (Apple). */
export function verifiedFlag(v: unknown): boolean {
  return v === true || v === "true";
}

/**
 * One sign-in provider. An OAuth provider is enabled when all its env vars are set, and `profile` turns its profile
 * into the fields `resolveUser` needs; adding one (Apple, ...) is an entry here plus its env vars. A credentials
 * provider (email code, passkey) resolves the user itself in `authorize` and says when it's available.
 */
type ProviderDef =
  | {
      id: string;
      kind: "oauth";
      env: string[];
      create: () => Provider;
      profile: (profile: Record<string, unknown> | undefined) => Omit<SignInIdentity, "provider" | "providerAccountId">;
    }
  | { id: string; kind: "credentials"; enabled: () => boolean; create: () => Provider };

const str = (v: unknown) => (typeof v === "string" ? v : null);

const PROVIDERS: ProviderDef[] = [
  {
    id: "google",
    kind: "oauth",
    env: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"],
    create: () => GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! }),
    profile: (p) => ({
      email: str(p?.email),
      emailVerified: verifiedFlag(p?.email_verified),
      name: str(p?.given_name) || str(p?.name),
      image: str(p?.picture),
    }),
  },
  // A 6-digit code emailed to the address proves it's theirs, so the identity is verified (and can link to an
  // existing account with that email). Also the way back in after losing a passkey.
  {
    id: "email",
    kind: "credentials",
    enabled: () => emailEnabled,
    create: () =>
      CredentialsProvider({
        id: "email",
        name: "Email",
        credentials: { email: { type: "email" }, code: { type: "text" } },
        async authorize(credentials) {
          const email = normalizeEmail(credentials?.email);
          if (!email || !(await verifyCode(email, credentials?.code))) return null;
          const user = await resolveUser({ provider: "email", providerAccountId: email, email, emailVerified: true });
          return { id: user.id };
        },
      }),
  },
  // A passkey made while signed in by another method; signs straight back in to that account.
  {
    id: "passkey",
    kind: "credentials",
    enabled: () => PROVIDERS.some((p) => p.id !== "passkey" && isEnabled(p)),
    create: () =>
      CredentialsProvider({
        id: "passkey",
        name: "Passkey",
        credentials: { response: { type: "text" } },
        async authorize(credentials, req) {
          let response: AuthenticationResponseJSON;
          try {
            response = JSON.parse(credentials?.response ?? "");
          } catch {
            return null;
          }
          const userId = await finishLogin(response, relyingParty(req?.headers ?? {}));
          return userId ? { id: userId } : null;
        },
      }),
  },
];

function isEnabled(p: ProviderDef): boolean {
  return p.kind === "oauth" ? p.env.every((name) => Boolean(process.env[name])) : p.enabled();
}

const enabledDefs = PROVIDERS.filter(isEnabled);

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
    async jwt({ token, account, profile, user }) {
      // First sign-in: find or create our User for this identity. The token only ever carries our user id.
      const def = defFor(account?.provider);
      if (def?.kind === "credentials" && user?.id) {
        token.uid = user.id; // authorize() already resolved it
      } else if (def?.kind === "oauth" && account?.providerAccountId) {
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
