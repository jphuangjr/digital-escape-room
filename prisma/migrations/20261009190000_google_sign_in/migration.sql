-- AlterTable
ALTER TABLE "public"."Player" ADD COLUMN     "image" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "gameId" TEXT NOT NULL DEFAULT 'ada-voss';

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roomRef" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "ending" TEXT,
    "wasHost" BOOLEAN NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSub_key" ON "public"."User"("googleSub");

-- CreateIndex
CREATE INDEX "CaseRecord_userId_gameId_idx" ON "public"."CaseRecord"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseRecord_userId_roomRef_key" ON "public"."CaseRecord"("userId", "roomRef");

-- CreateIndex
CREATE UNIQUE INDEX "Player_roomId_userId_key" ON "public"."Player"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseRecord" ADD CONSTRAINT "CaseRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep Supabase's anon REST API out of the new tables (see 20261009000000_enable_rls).
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CaseRecord" ENABLE ROW LEVEL SECURITY;
