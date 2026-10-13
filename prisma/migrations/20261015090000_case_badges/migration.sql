-- Badges earned in each case, kept after the room itself is gone.
ALTER TABLE "public"."CaseRecord" ADD COLUMN "badges" TEXT[] DEFAULT ARRAY[]::TEXT[];
