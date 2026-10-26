import "server-only";
import type { User } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { appleClientSecret } from "./apple";
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
 * into the fields `resolveUser` needs; adding one is an entry here plus its env vars. A credentials
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
  // Apple returns to us with a cross-site POST (response_mode=form_post); see `callbackCookies`. It sends the name
  // only on the very first sign-in and not in the ID token, so Apple accounts start without one.
  {
    id: "apple",
    kind: "oauth",
    env: ["AUTH_APPLE_ID", "AUTH_APPLE_TEAM_ID", "AUTH_APPLE_KEY_ID", "AUTH_APPLE_PRIVATE_KEY"],
    create: () =>
      AppleProvider({
        clientId: process.env.AUTH_APPLE_ID!,
        clientSecret: appleClientSecret({
          clientId: process.env.AUTH_APPLE_ID!,
          teamId: process.env.AUTH_APPLE_TEAM_ID!,
          keyId: process.env.AUTH_APPLE_KEY_ID!,
          privateKey: process.env.AUTH_APPLE_PRIVATE_KEY!,
        }),
      }),
    profile: (p) => ({ email: str(p?.email), emailVerified: verifiedFlag(p?.email_verified), name: null, image: null }),
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

/** A provider that fails to set up (say, a malformed Apple key) is left out instead of taking sign-in down. */
function usable(p: ProviderDef): boolean {
  if (!isEnabled(p)) return false;
  try {
    p.create();
    return true;
  } catch (err) {
    console.error(`[auth] ${p.id} sign-in is misconfigured`, err instanceof Error ? err.message : err);
    return false;
  }
}

const enabledDefs = PROVIDERS.filter(usable);

/**
 * The cookies an OAuth round trip reads back in its callback. Apple's callback is a cross-site POST, which doesn't
 * carry SameSite=Lax cookies, so with Apple on they're SameSite=None (that needs Secure, so only over https). The
 * session cookie itself stays Lax. Names and the rest of the options match next-auth's defaults.
 */
export function callbackCookies(secure: boolean, apple: boolean): NextAuthOptions["cookies"] {
  if (!apple || !secure) return undefined;
  const opts = (maxAge?: number) => ({ httpOnly: true, sameSite: "none" as const, path: "/", secure: true, ...(maxAge ? { maxAge } : {}) });
  return {
    callbackUrl: { name: "__Secure-next-auth.callback-url", options: opts() },
    pkceCodeVerifier: { name: "__Secure-next-auth.pkce.code_verifier", options: opts(60 * 15) },
    state: { name: "__Secure-next-auth.state", options: opts(60 * 15) },
    nonce: { name: "__Secure-next-auth.nonce", options: opts() },
  };
}

// next-auth uses Secure cookies when the site is https: always on Vercel, else when NEXTAUTH_URL says so.
const secureSite = Boolean(process.env.VERCEL) || Boolean(process.env.NEXTAUTH_URL?.startsWith("https://"));

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
  cookies: callbackCookies(secureSite, enabledDefs.some((p) => p.id === "apple")),
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
