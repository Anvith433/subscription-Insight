CREATE TABLE supported_services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_plan_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(255) NOT NULL,
    tier_name VARCHAR(100) NOT NULL,
    monthly_price NUMERIC(10,2) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_provider_tier UNIQUE (provider_name, tier_name)
);

ALTER TABLE usage_tracking
    ADD COLUMN idempotency_key VARCHAR(120) NULL;

CREATE UNIQUE INDEX uk_usage_tracking_user_idempotency
    ON usage_tracking(user_id, idempotency_key);

INSERT INTO supported_services(provider_name, host, is_active) VALUES
    ('Netflix', 'www.netflix.com', TRUE),
    ('Spotify', 'open.spotify.com', TRUE),
    ('YouTube', 'www.youtube.com', TRUE),
    ('YouTube Music', 'music.youtube.com', TRUE),
    ('Prime Video', 'www.primevideo.com', TRUE);

INSERT INTO provider_plan_tiers(provider_name, tier_name, monthly_price, sort_order) VALUES
    ('Netflix', 'Mobile', 6.99, 1),
    ('Netflix', 'Standard', 15.49, 2),
    ('Netflix', 'Premium', 22.99, 3),
    ('Spotify', 'Mini', 1.20, 1),
    ('Spotify', 'Individual', 9.99, 2),
    ('Spotify', 'Family', 16.99, 3),
    ('YouTube', 'Premium Individual', 13.99, 1),
    ('YouTube', 'Premium Family', 22.99, 2),
    ('Prime Video', 'Lite', 4.99, 1),
    ('Prime Video', 'Monthly', 8.99, 2);
