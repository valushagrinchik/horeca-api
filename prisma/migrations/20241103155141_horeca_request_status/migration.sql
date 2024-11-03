-- CreateEnum
CREATE TYPE "HorecaRequestStatus" AS ENUM ('WaitingForProviderRequests', 'Active', 'CompletedSuccessfully', 'CompletedUnsuccessfully');

-- AlterTable
ALTER TABLE "horeca_requests" ADD COLUMN     "status" "HorecaRequestStatus" NOT NULL DEFAULT 'WaitingForProviderRequests';
