import "server-only";
import type { User } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

/** Google sign-in is configured only when both OAuth env vars are present. */
export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 90 * 24 * 60 * 60 },
  providers: googleEnabled
    ? [
        GoogleProvider({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    async signIn({ account }) {
      return account?.provider === "google" && Boolean(account.providerAccountId);
    },
    async jwt({ token, account, profile }) {
      // First sign-in: upsert our User row keyed by Google's stable subject id.
      if (account?.provider === "google" && account.providerAccountId) {
        const p = profile as { email?: string; name?: string; given_name?: string; picture?: string } | undefined;
        const user = await db.user.upsert({
          where: { googleSub: account.providerAccountId },
          create: { googleSub: account.providerAccountId, email: p?.email, name: p?.given_name || p?.name, image: p?.picture },
          update: { email: p?.email, name: p?.given_name || p?.name, image: p?.picture },
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
  if (!googleEnabled) return null;
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}
