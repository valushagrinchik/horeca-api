/*
  Warnings:

  - The values [ProviderRequest] on the enum `UploadsLinkType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `available` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `provider_requests` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UploadsLinkType_new" AS ENUM ('ProviderRequestItem', 'HorecaRequest', 'Product');
ALTER TABLE "uploads_links" ALTER COLUMN "sourceType" TYPE "UploadsLinkType_new" USING ("sourceType"::text::"UploadsLinkType_new");
ALTER TYPE "UploadsLinkType" RENAME TO "UploadsLinkType_old";
ALTER TYPE "UploadsLinkType_new" RENAME TO "UploadsLinkType";
DROP TYPE "UploadsLinkType_old";
COMMIT;

-- AlterTable
ALTER TABLE "provider_requests" DROP COLUMN "available",
DROP COLUMN "cost",
DROP COLUMN "manufacturer",
DROP COLUMN "payment_type";

-- CreateTable
CREATE TABLE "provider_requests_items" (
    "id" SERIAL NOT NULL,
    "provider_request_id" INTEGER NOT NULL,
    "horeca_request_item_id" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "manufacturer" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_requests_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "provider_requests_items" ADD CONSTRAINT "provider_requests_items_provider_request_id_fkey" FOREIGN KEY ("provider_request_id") REFERENCES "provider_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_items" ADD CONSTRAINT "provider_requests_items_horeca_request_item_id_fkey" FOREIGN KEY ("horeca_request_item_id") REFERENCES "horeca_request_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
