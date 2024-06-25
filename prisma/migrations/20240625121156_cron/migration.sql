/*
  Warnings:

  - You are about to drop the column `source` on the `cron_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `source_id` on the `cron_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `source_type` on the `cron_tasks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cron_id]` on the table `mails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cron_id` to the `mails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cron_tasks" DROP COLUMN "source",
DROP COLUMN "source_id",
DROP COLUMN "source_type";

-- AlterTable
ALTER TABLE "mails" ADD COLUMN     "cron_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "mails_cron_id_key" ON "mails"("cron_id");

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_cron_id_fkey" FOREIGN KEY ("cron_id") REFERENCES "cron_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
