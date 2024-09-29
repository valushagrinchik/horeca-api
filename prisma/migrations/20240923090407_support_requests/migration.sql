/*
  Warnings:

  - You are about to drop the column `chat_id` on the `horeca_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type,source_id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source_id` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "horeca_requests" DROP CONSTRAINT "horeca_requests_chat_id_fkey";

-- DropIndex
DROP INDEX "horeca_requests_chat_id_key";

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "source_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "horeca_requests" DROP COLUMN "chat_id";

-- CreateTable
CREATE TABLE "support_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_type_source_id_key" ON "chats"("type", "source_id");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
