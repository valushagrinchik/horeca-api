/*
  Warnings:

  - You are about to drop the column `cron_status` on the `cron_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `cron_tries` on the `cron_tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cron_tasks" DROP COLUMN "cron_status",
DROP COLUMN "cron_tries",
ADD COLUMN     "status" "CronStatus" NOT NULL DEFAULT 'Ready',
ADD COLUMN     "tries" INTEGER NOT NULL DEFAULT 0;
