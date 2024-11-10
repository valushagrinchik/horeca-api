-- CreateEnum
CREATE TYPE "SupportRequestStatus" AS ENUM ('Default', 'Active', 'Resolved');

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "support_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT,
    "status" "SupportRequestStatus" NOT NULL DEFAULT 'Default',
    "admin_id" INTEGER,
    "chat_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_requests_chat_id_key" ON "support_requests"("chat_id");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
