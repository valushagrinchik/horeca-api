/*
  Warnings:

  - Added the required column `user_id` to the `horeca_request_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "horeca_request_templates" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "horeca_request_templates" ADD CONSTRAINT "horeca_request_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
