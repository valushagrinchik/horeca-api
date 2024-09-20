/*
  Warnings:

  - You are about to drop the column `provider_request_id` on the `chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chat_id]` on the table `horeca_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_provider_request_id_fkey";

-- DropIndex
DROP INDEX "chats_provider_request_id_key";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "provider_request_id";

-- AlterTable
ALTER TABLE "horeca_requests" ADD COLUMN     "chat_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "horeca_requests_chat_id_key" ON "horeca_requests"("chat_id");

-- AddForeignKey
ALTER TABLE "horeca_requests" ADD CONSTRAINT "horeca_requests_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
