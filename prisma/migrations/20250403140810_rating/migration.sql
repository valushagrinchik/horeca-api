ALTER TABLE "users" ADD COLUMN "rating" FLOAT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION recalculate_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "users"
        SET rating = (
            SELECT 
                CAST((SUM(prr.is_delivered) + SUM(prr.is_successfully)) AS FLOAT) * 5
                / (2 * COUNT(*))
            FROM provider_requests pr
            JOIN provider_requests_review prr ON prr.provider_request_id = pr.id
            WHERE pr.user_id = (SELECT user_id 
                FROM provider_requests 
                WHERE provider_requests.id = NEW.provider_request_id
            ) AND pr.status = 'Finished'::"ProviderRequestStatus"
        )
    WHERE id = (SELECT user_id 
    FROM provider_requests 
    WHERE provider_requests.id = NEW.provider_request_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER provider_requests_review_insert_trigger
AFTER INSERT ON "provider_requests_review"
FOR EACH ROW EXECUTE FUNCTION recalculate_user_rating();
