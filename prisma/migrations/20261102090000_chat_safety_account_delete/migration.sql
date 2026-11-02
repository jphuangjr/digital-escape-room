-- DropForeignKey
ALTER TABLE "public"."PurchaseCode" DROP CONSTRAINT "PurchaseCode_createdById_fkey";

-- AlterTable
ALTER TABLE "public"."PurchaseCode" ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."PlayerBlock" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlock" (
    "id" TEXT NOT NULL,
    "blockerUserId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatReport" (
    "id" TEXT NOT NULL,
    "roomRef" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reportedPlayerId" TEXT NOT NULL,
    "reportedName" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reporterPlayerId" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerBlock_roomId_idx" ON "public"."PlayerBlock"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerBlock_blockerId_blockedId_key" ON "public"."PlayerBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerUserId_blockedUserId_key" ON "public"."UserBlock"("blockerUserId", "blockedUserId");

-- CreateIndex
CREATE INDEX "ChatReport_resolvedAt_createdAt_idx" ON "public"."ChatReport"("resolvedAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReport_messageId_reporterPlayerId_key" ON "public"."ChatReport"("messageId", "reporterPlayerId");

-- AddForeignKey
ALTER TABLE "public"."PurchaseCode" ADD CONSTRAINT "PurchaseCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerBlock" ADD CONSTRAINT "PlayerBlock_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlock" ADD CONSTRAINT "UserBlock_blockerUserId_fkey" FOREIGN KEY ("blockerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBlock" ADD CONSTRAINT "UserBlock_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatReport" ADD CONSTRAINT "ChatReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatReport" ADD CONSTRAINT "ChatReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Like every table: no access through Supabase's public API, only through the server.
ALTER TABLE "public"."PlayerBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UserBlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ChatReport" ENABLE ROW LEVEL SECURITY;
