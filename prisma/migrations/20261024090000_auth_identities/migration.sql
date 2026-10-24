-- Sign-in identities: a User can have several (Google today; Apple etc. later). Additive only, so the code
-- currently deployed (which still reads and writes User.googleSub) keeps working during the rollout.

-- User.googleSub becomes optional (kept, with its unique index, until a later migration drops it), and the user
-- remembers whether its email came verified from a provider (only verified emails count for admin).
ALTER TABLE "public"."User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "googleSub" DROP NOT NULL;

CREATE TABLE "public"."AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuthIdentity_userId_idx" ON "public"."AuthIdentity"("userId");
CREATE UNIQUE INDEX "AuthIdentity_provider_providerAccountId_key" ON "public"."AuthIdentity"("provider", "providerAccountId");
ALTER TABLE "public"."AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Like every table: no access through Supabase's REST API (Prisma connects as the owner and bypasses RLS).
ALTER TABLE "public"."AuthIdentity" ENABLE ROW LEVEL SECURITY;

-- Backfill: every existing user signed in with Google, whose emails Google verifies.
INSERT INTO "public"."AuthIdentity" ("id", "userId", "provider", "providerAccountId", "email", "emailVerified", "createdAt")
SELECT gen_random_uuid()::text, "id", 'google', "googleSub", "email", true, "createdAt"
FROM "public"."User"
WHERE "googleSub" IS NOT NULL
ON CONFLICT ("provider", "providerAccountId") DO NOTHING;

UPDATE "public"."User" SET "emailVerified" = true WHERE "googleSub" IS NOT NULL AND "email" IS NOT NULL;
