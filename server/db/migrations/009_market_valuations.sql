CREATE TABLE IF NOT EXISTS market_valuations (
    id SERIAL PRIMARY KEY,
    make VARCHAR(191) NOT NULL,
    model VARCHAR(191) NOT NULL,
    year INTEGER NOT NULL,
    market_type VARCHAR(50) NOT NULL, -- 'foreign_used' or 'nigerian_used'
    estimated_value_ngn BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(make, model, year, market_type)
);

CREATE INDEX IF NOT EXISTS idx_market_valuations_lookup ON market_valuations(make, model, year, market_type);
