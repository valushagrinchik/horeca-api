-- CreateTable
CREATE TABLE "provider_requests_review" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_delivered" INTEGER NOT NULL,
    "is_successfully" INTEGER NOT NULL,
    "provider_request_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_requests_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_requests_review_provider_request_id_key" ON "provider_requests_review"("provider_request_id");

-- AddForeignKey
ALTER TABLE "provider_requests_review" ADD CONSTRAINT "provider_requests_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_review" ADD CONSTRAINT "provider_requests_review_provider_request_id_fkey" FOREIGN KEY ("provider_request_id") REFERENCES "provider_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
