-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Prepayment', 'Deferment', 'PaymentUponDelivery');

-- CreateTable
CREATE TABLE "horeca_applications" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "delivery_time" TIMESTAMP(3) NOT NULL,
    "accept_untill" TIMESTAMP(3) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "horeca_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horeca_application_items" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "horeca_application_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horeca_application_images" (
    "id" SERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "horeca_application_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "horeca_application_items" ADD CONSTRAINT "horeca_application_items_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "horeca_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_application_images" ADD CONSTRAINT "horeca_application_images_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "horeca_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_application_images" ADD CONSTRAINT "horeca_application_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
