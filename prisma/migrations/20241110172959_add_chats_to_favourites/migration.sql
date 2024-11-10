/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `horeca_favourites` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "horeca_favourites" ADD COLUMN     "chat_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "horeca_favourites_chat_id_key" ON "horeca_favourites"("chat_id");

-- AddForeignKey
ALTER TABLE "horeca_favourites" ADD CONSTRAINT "horeca_favourites_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
