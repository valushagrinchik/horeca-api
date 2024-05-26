-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('Provider', 'Horeca');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Horeca', 'Provider');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_profile_id_key" ON "addresses"("profile_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
