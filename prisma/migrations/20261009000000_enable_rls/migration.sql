-- Supabase exposes the public schema through its REST API using the public anon key.
-- Enable RLS with no policies so those roles can read/write nothing; Prisma connects as
-- the table owner, which bypasses RLS.
ALTER TABLE "public"."Room" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Attempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HintRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."EndingVote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AnalyticsEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
