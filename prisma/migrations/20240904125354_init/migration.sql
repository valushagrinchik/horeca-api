-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('Provider', 'Horeca');

-- CreateEnum
CREATE TYPE "UploadsLinkType" AS ENUM ('ProviderRequest', 'HorecaRequest', 'Product');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Horeca', 'Provider');

-- CreateEnum
CREATE TYPE "ProductPackagingType" AS ENUM ('Bottle', 'Box', 'Pallet');

-- CreateEnum
CREATE TYPE "CronStatus" AS ENUM ('Ready', 'Work', 'Done', 'Error', 'Failed');

-- CreateEnum
CREATE TYPE "CronType" AS ENUM ('Mail');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Prepayment', 'Deferment', 'PaymentUponDelivery');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('Support', 'Order', 'Private');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activation_link" TEXT NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profile_type" "ProfileType" NOT NULL,
    "min_order_amount" INTEGER,
    "delivery_methods" TEXT[],
    "categories" TEXT[],
    "info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "mo_from" TEXT,
    "mo_to" TEXT,
    "tu_from" TEXT,
    "tu_to" TEXT,
    "we_from" TEXT,
    "we_to" TEXT,
    "th_from" TEXT,
    "th_to" TEXT,
    "fr_from" TEXT,
    "fr_to" TEXT,
    "sa_from" TEXT,
    "sa_to" TEXT,
    "su_from" TEXT,
    "su_to" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,
    "packaging_type" "ProductPackagingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads_links" (
    "id" SERIAL NOT NULL,
    "sourceType" "UploadsLinkType" NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_tasks" (
    "id" SERIAL NOT NULL,
    "status" "CronStatus" NOT NULL DEFAULT 'Ready',
    "tries" INTEGER NOT NULL DEFAULT 0,
    "start" TIMESTAMP(3),
    "finish" TIMESTAMP(3),
    "proof" TEXT,
    "pid" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cron_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "cron_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_logs" (
    "id" SERIAL NOT NULL,
    "mail_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horeca_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "delivery_time" TIMESTAMP(3) NOT NULL,
    "accept_untill" TIMESTAMP(3) NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "comment" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "horeca_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horeca_request_items" (
    "id" SERIAL NOT NULL,
    "horeca_request_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "horeca_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horeca_request_templates" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "horeca_request_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "horeca_request_id" INTEGER NOT NULL,
    "comment" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "manufacturer" TEXT NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "approved_by_horeca" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "opponents" INTEGER[],
    "type" "ChatType" NOT NULL,
    "provider_request_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "author_id" INTEGER,
    "is_server" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uploads_links_imageId_key" ON "uploads_links"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "mails_cron_id_key" ON "mails"("cron_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_requests_horeca_request_id_key" ON "provider_requests"("horeca_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "chats_provider_request_id_key" ON "chats"("provider_request_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads_links" ADD CONSTRAINT "uploads_links_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_cron_id_fkey" FOREIGN KEY ("cron_id") REFERENCES "cron_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_logs" ADD CONSTRAINT "mail_logs_mail_id_fkey" FOREIGN KEY ("mail_id") REFERENCES "mails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_requests" ADD CONSTRAINT "horeca_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_items" ADD CONSTRAINT "horeca_request_items_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_provider_request_id_fkey" FOREIGN KEY ("provider_request_id") REFERENCES "provider_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
