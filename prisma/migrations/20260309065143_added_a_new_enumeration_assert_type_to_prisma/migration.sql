/*
  Warnings:

  - Changed the type of `assetType` on the `Asset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('NETWORK', 'SOFTWARE', 'HARDWARE');

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assetType",
ADD COLUMN     "assetType" "AssetType" NOT NULL;

-- CreateIndex
CREATE INDEX "Asset_assetType_idx" ON "Asset"("assetType");
