-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_favourites" DROP CONSTRAINT "horeca_favourites_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_favourites" DROP CONSTRAINT "horeca_favourites_user_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_request_items" DROP CONSTRAINT "horeca_request_items_horeca_request_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_request_provider_status" DROP CONSTRAINT "horeca_request_provider_status_horeca_request_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_request_provider_status" DROP CONSTRAINT "horeca_request_provider_status_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_request_templates" DROP CONSTRAINT "horeca_request_templates_user_id_fkey";

-- DropForeignKey
ALTER TABLE "horeca_requests" DROP CONSTRAINT "horeca_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "mail_logs" DROP CONSTRAINT "mail_logs_mail_id_fkey";

-- DropForeignKey
ALTER TABLE "mails" DROP CONSTRAINT "mails_cron_id_fkey";

-- DropForeignKey
ALTER TABLE "mails" DROP CONSTRAINT "mails_user_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_user_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests" DROP CONSTRAINT "provider_requests_horeca_request_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests" DROP CONSTRAINT "provider_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests_items" DROP CONSTRAINT "provider_requests_items_horeca_request_item_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests_items" DROP CONSTRAINT "provider_requests_items_provider_request_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests_review" DROP CONSTRAINT "provider_requests_review_provider_request_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_requests_review" DROP CONSTRAINT "provider_requests_review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "support_requests" DROP CONSTRAINT "support_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "uploads_links" DROP CONSTRAINT "uploads_links_imageId_fkey";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads_links" ADD CONSTRAINT "uploads_links_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mails" ADD CONSTRAINT "mails_cron_id_fkey" FOREIGN KEY ("cron_id") REFERENCES "cron_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mail_logs" ADD CONSTRAINT "mail_logs_mail_id_fkey" FOREIGN KEY ("mail_id") REFERENCES "mails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_favourites" ADD CONSTRAINT "horeca_favourites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_favourites" ADD CONSTRAINT "horeca_favourites_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_requests" ADD CONSTRAINT "horeca_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_items" ADD CONSTRAINT "horeca_request_items_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_templates" ADD CONSTRAINT "horeca_request_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_provider_status" ADD CONSTRAINT "horeca_request_provider_status_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horeca_request_provider_status" ADD CONSTRAINT "horeca_request_provider_status_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_horeca_request_id_fkey" FOREIGN KEY ("horeca_request_id") REFERENCES "horeca_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_review" ADD CONSTRAINT "provider_requests_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_review" ADD CONSTRAINT "provider_requests_review_provider_request_id_fkey" FOREIGN KEY ("provider_request_id") REFERENCES "provider_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_items" ADD CONSTRAINT "provider_requests_items_provider_request_id_fkey" FOREIGN KEY ("provider_request_id") REFERENCES "provider_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests_items" ADD CONSTRAINT "provider_requests_items_horeca_request_item_id_fkey" FOREIGN KEY ("horeca_request_item_id") REFERENCES "horeca_request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
