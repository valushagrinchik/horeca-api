-- CreateTable
CREATE TABLE "products_images" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "imageId" INTEGER,

    CONSTRAINT "products_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_images_imageId_key" ON "products_images"("imageId");

-- AddForeignKey
ALTER TABLE "products_images" ADD CONSTRAINT "products_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_images" ADD CONSTRAINT "products_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
