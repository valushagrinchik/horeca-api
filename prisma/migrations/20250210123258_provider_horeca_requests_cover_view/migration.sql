CREATE MATERIALIZED VIEW provider_horeca_requests_cover_view AS
SELECT 
    p.user_id AS provider_id, 
    p.categories AS provider_profile_categories, 
    hr.id AS horeca_request_id, 
    hr.categories AS horeca_request_categories, 
    hr.created_at AS horeca_request_created_at, 
    hr.accept_untill AS horeca_request_accept_untill, 
    COALESCE(
        array_length(
            (SELECT ARRAY(
                SELECT UNNEST(p.categories) 
                INTERSECT 
                SELECT UNNEST(COALESCE(hr.categories, ARRAY[]::TEXT[]))
            )), 1
        ), 0
    )::FLOAT 
    / NULLIF(array_length(COALESCE(ARRAY(SELECT UNNEST(hr.categories)), ARRAY[]::TEXT[]), 1), 0) AS cover
FROM public.profiles p
CROSS JOIN public.horeca_requests hr
WHERE p.profile_type = 'Provider' AND p.categories && hr.categories;

CREATE UNIQUE INDEX idx_provider_id_horeca_request_id ON provider_horeca_requests_cover_view (provider_id, horeca_request_id)