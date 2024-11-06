/*
  Warnings:

  - The values [WaitingForProviderRequests] on the enum `HorecaRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `active_provider_request_id` on the `horeca_requests` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderRequestStatus" AS ENUM ('Pending', 'Active', 'Canceled', 'Finished');

-- AlterEnum
BEGIN;
CREATE TYPE "HorecaRequestStatus_new" AS ENUM ('Pending', 'Active', 'CompletedSuccessfully', 'CompletedUnsuccessfully');
ALTER TABLE "horeca_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "horeca_requests" ALTER COLUMN "status" TYPE "HorecaRequestStatus_new" USING ("status"::text::"HorecaRequestStatus_new");
ALTER TYPE "HorecaRequestStatus" RENAME TO "HorecaRequestStatus_old";
ALTER TYPE "HorecaRequestStatus_new" RENAME TO "HorecaRequestStatus";
DROP TYPE "HorecaRequestStatus_old";
ALTER TABLE "horeca_requests" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "horeca_requests" DROP CONSTRAINT "horeca_requests_active_provider_request_id_fkey";

-- DropIndex
DROP INDEX "horeca_requests_active_provider_request_id_key";

-- AlterTable
ALTER TABLE "horeca_requests" DROP COLUMN "active_provider_request_id",
ALTER COLUMN "status" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "provider_requests" ADD COLUMN     "status" "ProviderRequestStatus" NOT NULL DEFAULT 'Pending';
