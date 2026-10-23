-- Admin test runs stay off the public leaderboards. Older test runs are hidden by hand from the admin page
-- (admins are listed in an env var, which SQL can't see).
ALTER TABLE "public"."LeaderboardEntry" ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false;
