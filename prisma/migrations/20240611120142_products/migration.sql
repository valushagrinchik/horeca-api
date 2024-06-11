-- CreateEnum
CREATE TYPE "ProductPackagingType" AS ENUM ('Bottle', 'Box', 'Pallet');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "packaging_type" "ProductPackagingType" NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_profile_id_key" ON "products"("profile_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
