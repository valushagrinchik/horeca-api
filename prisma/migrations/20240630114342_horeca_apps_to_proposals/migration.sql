/*
  Warnings:

  - You are about to drop the `horeca_application_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horeca_application_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horeca_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horeca_applications_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "horeca_application_images" DROP CONSTRAINT "horeca_application_images_app_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_application_images" DROP CONSTRAINT "horeca_application_images_imageId_fkey";

-- DropForeignKey
ALTER TABLE "horeca_application_items" DROP CONSTRAINT "horeca_application_items_app_id_fkey";

-- DropTable
DROP TABLE "horeca_application_images";

-- DropTable
DROP TABLE "horeca_application_items";

-- DropTable
DROP TABLE "horeca_applications";

-- DropTable
DROP TABLE "horeca_applications_templates";

-- CreateTable
CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "delivery_time" TIMESTAMP(3) NOT NULL,
    "accept_untill" TIMESTAMP(3) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "comment" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_items" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_images" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_templates" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_images" ADD CONSTRAINT "proposal_images_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_images" ADD CONSTRAINT "proposal_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
