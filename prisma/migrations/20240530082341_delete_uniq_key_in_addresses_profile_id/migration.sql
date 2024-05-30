-- DropIndex
DROP INDEX "addresses_profile_id_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;
