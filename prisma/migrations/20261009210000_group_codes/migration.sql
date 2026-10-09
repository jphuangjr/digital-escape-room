-- Group codes: codes can allow more than one redemption (once per account), expire, and be turned off.
-- Existing single-use codes keep maxUses = 1 and their redemption history is moved to CodeRedemption.

-- 1. New columns.
ALTER TABLE "public"."PurchaseCode"
  ADD COLUMN "maxUses" INTEGER DEFAULT 1,
  ADD COLUMN "useCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "revokedAt" TIMESTAMP(3);

-- 2. Redemptions table.
CREATE TABLE "public"."CodeRedemption" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeRedemption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CodeRedemption_codeId_userId_key" ON "public"."CodeRedemption"("codeId", "userId");
ALTER TABLE "public"."CodeRedemption" ADD CONSTRAINT "CodeRedemption_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "public"."PurchaseCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."CodeRedemption" ADD CONSTRAINT "CodeRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Carry over existing redemptions before dropping the old columns.
INSERT INTO "public"."CodeRedemption" ("id", "codeId", "userId", "createdAt")
SELECT 'mig_' || md5("id" || "redeemedById"), "id", "redeemedById", COALESCE("redeemedAt", CURRENT_TIMESTAMP)
FROM "public"."PurchaseCode"
WHERE "redeemedById" IS NOT NULL;

UPDATE "public"."PurchaseCode" SET "useCount" = 1 WHERE "redeemedById" IS NOT NULL;

-- 4. Drop the old single-redeemer columns.
ALTER TABLE "public"."PurchaseCode" DROP CONSTRAINT "PurchaseCode_redeemedById_fkey";
ALTER TABLE "public"."PurchaseCode" DROP COLUMN "redeemedAt", DROP COLUMN "redeemedById";

-- Keep Supabase's anon REST API out of the new table.
ALTER TABLE "public"."CodeRedemption" ENABLE ROW LEVEL SECURITY;
