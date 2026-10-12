-- State for physical-room games (The Nightingale Express): flags, shared inventory, case log.
ALTER TABLE "public"."Room" ADD COLUMN "scene" JSONB;
