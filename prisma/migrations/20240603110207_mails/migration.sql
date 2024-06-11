-- CreateTable
CREATE TABLE "Mails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "context" JSONB NOT NULL,

    CONSTRAINT "Mails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mails" ADD CONSTRAINT "Mails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
