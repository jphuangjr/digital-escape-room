-- Teams that finished but named the wrong suspect rank below every correct solve.
ALTER TABLE "public"."LeaderboardEntry" ADD COLUMN "solved" BOOLEAN NOT NULL DEFAULT true;
