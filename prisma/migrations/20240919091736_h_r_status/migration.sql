-- CreateTable
CREATE TABLE "horeca_request_provider_status" (
    "horeca_request_id" INTEGER NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "provider_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "horeca_request_provider_status_horeca_request_id_key" ON "horeca_request_provider_status"("horeca_request_id");

-- AddForeignKey
ALTER TABLE "horeca_request_provider_status" ADD CONSTRAINT "horeca_request_provider_status_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_provider_status" ADD CONSTRAINT "horeca_request_provider_status_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
