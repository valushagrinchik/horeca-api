/*
  Warnings:

  - You are about to drop the column `chat_id` on the `horeca_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chat_id]` on the table `provider_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "horeca_requests" DROP CONSTRAINT "horeca_requests_chat_id_fkey";

-- DropIndex
DROP INDEX "horeca_requests_chat_id_key";

-- AlterTable
ALTER TABLE "horeca_requests" DROP COLUMN "chat_id";

-- AlterTable
ALTER TABLE "provider_requests" ADD COLUMN     "chat_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "provider_requests_chat_id_key" ON "provider_requests"("chat_id");

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
