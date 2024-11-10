/*
  Warnings:

  - The values [Finished] on the enum `HorecaRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
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
