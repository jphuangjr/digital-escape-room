-- Email-code sign-in and passkeys. Additive only: three new tables, nothing existing changes.
-- CreateTable
CREATE TABLE "public"."Passkey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "public"."EmailCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailCode_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "public"."AuthChallenge" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "Passkey_credentialId_key" ON "public"."Passkey"("credentialId");
-- CreateIndex
CREATE INDEX "Passkey_userId_idx" ON "public"."Passkey"("userId");
-- CreateIndex
CREATE INDEX "EmailCode_email_createdAt_idx" ON "public"."EmailCode"("email", "createdAt");
-- CreateIndex
CREATE INDEX "EmailCode_ipHash_createdAt_idx" ON "public"."EmailCode"("ipHash", "createdAt");
-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_challenge_key" ON "public"."AuthChallenge"("challenge");
-- CreateIndex
CREATE INDEX "AuthChallenge_expiresAt_idx" ON "public"."AuthChallenge"("expiresAt");
-- AddForeignKey
ALTER TABLE "public"."Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Like every table: no access through Supabase's REST API (Prisma connects as the owner and bypasses RLS).
ALTER TABLE "public"."Passkey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EmailCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuthChallenge" ENABLE ROW LEVEL SECURITY;
