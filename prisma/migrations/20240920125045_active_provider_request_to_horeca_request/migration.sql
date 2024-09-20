/*
  Warnings:

  - A unique constraint covering the columns `[active_provider_request_id]` on the table `horeca_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "horeca_requests" ADD COLUMN     "active_provider_request_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "horeca_requests_active_provider_request_id_key" ON "horeca_requests"("active_provider_request_id");

-- AddForeignKey
ALTER TABLE "horeca_requests" ADD CONSTRAINT "horeca_requests_active_provider_request_id_fkey" FOREIGN KEY ("active_provider_request_id") REFERENCES "provider_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
