/*
  Warnings:

  - A unique constraint covering the columns `[user_id,horeca_request_id]` on the table `provider_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "provider_requests_horeca_request_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "provider_requests_user_id_horeca_request_id_key" ON "provider_requests"("user_id", "horeca_request_id");
