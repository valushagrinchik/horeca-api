-- AlterTable
ALTER TABLE "uploads" ADD COLUMN     "chat_id" INTEGER;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
