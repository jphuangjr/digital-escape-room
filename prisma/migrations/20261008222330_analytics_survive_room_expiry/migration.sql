/*
  Warnings:

  - Added the required column `roomRef` to the `AnalyticsEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AnalyticsEvent" DROP CONSTRAINT "AnalyticsEvent_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."AnalyticsEvent" ADD COLUMN     "roomRef" TEXT NOT NULL,
ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
