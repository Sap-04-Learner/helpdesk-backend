/*
  Warnings:

  - You are about to drop the `AssetRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetRequest" DROP CONSTRAINT "AssetRequest_assetId_fkey";

-- DropForeignKey
ALTER TABLE "AssetRequest" DROP CONSTRAINT "AssetRequest_ticketId_fkey";

-- DropTable
DROP TABLE "AssetRequest";

-- CreateTable
CREATE TABLE "AssetIssue" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "assetId" TEXT,
    "assetCategory" TEXT,
    "assetClassification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetIssue_ticketId_key" ON "AssetIssue"("ticketId");

-- CreateIndex
CREATE INDEX "AssetIssue_assetId_idx" ON "AssetIssue"("assetId");

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetIssue" ADD CONSTRAINT "AssetIssue_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
