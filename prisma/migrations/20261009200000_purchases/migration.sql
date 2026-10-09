-- CreateTable
CREATE TABLE "public"."GamePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedById" TEXT,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamePurchase_userId_gameId_key" ON "public"."GamePurchase"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseCode_code_key" ON "public"."PurchaseCode"("code");

-- CreateIndex
CREATE INDEX "PurchaseCode_gameId_createdAt_idx" ON "public"."PurchaseCode"("gameId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."GamePurchase" ADD CONSTRAINT "GamePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseCode" ADD CONSTRAINT "PurchaseCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseCode" ADD CONSTRAINT "PurchaseCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Keep Supabase's anon REST API out of the new tables.
ALTER TABLE "public"."GamePurchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PurchaseCode" ENABLE ROW LEVEL SECURITY;
