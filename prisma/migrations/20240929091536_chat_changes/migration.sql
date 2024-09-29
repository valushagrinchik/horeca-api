/*
  Warnings:

  - You are about to drop the column `active` on the `support_requests` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SupportRequestStatus" AS ENUM ('Default', 'Active', 'Resolved');

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "support_requests" DROP COLUMN "active",
ADD COLUMN     "admin_id" INTEGER,
ADD COLUMN     "status" "SupportRequestStatus" NOT NULL DEFAULT 'Default';
