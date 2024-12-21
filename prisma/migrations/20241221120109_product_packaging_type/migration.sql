/*
  Warnings:

  - The `packaging_type` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "packaging_type",
ADD COLUMN     "packaging_type" TEXT;

-- DropEnum
DROP TYPE "ProductPackagingType";
