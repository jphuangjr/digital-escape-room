-- CreateTable
CREATE TABLE "public"."LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roomRef" TEXT NOT NULL,
    "players" JSONB NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "wrongAttempts" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL,
    "ending" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_roomRef_key" ON "public"."LeaderboardEntry"("roomRef");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_gameId_durationMs_idx" ON "public"."LeaderboardEntry"("gameId", "durationMs");

-- Keep Supabase's anon REST API out of the new table.
ALTER TABLE "public"."LeaderboardEntry" ENABLE ROW LEVEL SECURITY;

-- Backfill from rooms that already escaped and haven't expired yet.
INSERT INTO "public"."LeaderboardEntry"
  ("id", "gameId", "roomRef", "players", "playerCount", "startedAt", "finishedAt", "durationMs",
   "attempts", "wrongAttempts", "hintsUsed", "ending")
SELECT
  'lb_' || r."id",
  r."gameId",
  r."id",
  COALESCE((SELECT jsonb_agg(jsonb_build_object('name', p."displayName", 'color', p."color") ORDER BY p."createdAt")
            FROM "public"."Player" p WHERE p."roomId" = r."id"), '[]'::jsonb),
  (SELECT COUNT(*) FROM "public"."Player" p WHERE p."roomId" = r."id"),
  r."createdAt",
  r."finishedAt",
  LEAST(EXTRACT(EPOCH FROM (r."finishedAt" - r."createdAt")) * 1000, 2147483647)::INTEGER,
  (SELECT COUNT(*) FROM "public"."Attempt" a WHERE a."roomId" = r."id" AND a."createdAt" <= r."finishedAt"),
  (SELECT COUNT(*) FROM "public"."Attempt" a WHERE a."roomId" = r."id" AND a."createdAt" <= r."finishedAt" AND NOT a."correct"),
  (SELECT COUNT(*) FROM "public"."HintRequest" h WHERE h."roomId" = r."id" AND h."createdAt" <= r."finishedAt"),
  r."ending"
FROM "public"."Room" r
WHERE r."finishedAt" IS NOT NULL;
