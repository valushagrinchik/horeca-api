/*
  Warnings:

  - You are about to drop the `Mails` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CronStatus" AS ENUM ('Ready', 'Work', 'Done', 'Error', 'Failed');

-- CreateEnum
CREATE TYPE "CronType" AS ENUM ('Mail');

-- DropForeignKey
ALTER TABLE "Mails" DROP CONSTRAINT "Mails_user_id_fkey";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Mails";

-- CreateTable
CREATE TABLE "mails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_logs" (
    "id" SERIAL NOT NULL,
    "mail_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_tasks" (
    "id" SERIAL NOT NULL,
    "source_type" "CronType" NOT NULL,
    "source_id" INTEGER NOT NULL,
    "cron_status" "CronStatus" NOT NULL,
    "cron_tries" INTEGER NOT NULL DEFAULT 0,
    "start" TIMESTAMP(3),
    "finish" TIMESTAMP(3),
    "proof" TEXT,
    "pid" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cron_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_logs" ADD CONSTRAINT "mail_logs_mail_id_fkey" FOREIGN KEY ("mail_id") REFERENCES "mails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
