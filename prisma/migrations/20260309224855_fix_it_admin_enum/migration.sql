/*
  Warnings:

  - The values [IT,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `assetType` on the `Asset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('NETWORK', 'SOFTWARE', 'HARDWARE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('EMPLOYEE', 'HR', 'IT_SUPPORT', 'IT_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assetType",
ADD COLUMN     "assetType" "AssetType" NOT NULL;

-- CreateTable
CREATE TABLE "AssetRequest" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "assetId" TEXT,
    "assetCategory" TEXT,
    "assetClassification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAssignment" (
    "id" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetRequest_ticketId_key" ON "AssetRequest"("ticketId");

-- CreateIndex
CREATE INDEX "AssetRequest_assetId_idx" ON "AssetRequest"("assetId");

-- CreateIndex
CREATE INDEX "AssetAssignment_assignedById_idx" ON "AssetAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "AssetAssignment_assignedToId_idx" ON "AssetAssignment"("assignedToId");

-- CreateIndex
CREATE INDEX "AssetAssignment_assetId_idx" ON "AssetAssignment"("assetId");

-- CreateIndex
CREATE INDEX "Asset_assetType_idx" ON "Asset"("assetType");

-- AddForeignKey
ALTER TABLE "AssetRequest" ADD CONSTRAINT "AssetRequest_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetRequest" ADD CONSTRAINT "AssetRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
