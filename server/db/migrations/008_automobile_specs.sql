-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    url_hash VARCHAR(191) NOT NULL,
    url TEXT NOT NULL,
    name VARCHAR(191) NOT NULL,
    logo TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Automobiles Table
CREATE TABLE IF NOT EXISTS automobiles (
    id SERIAL PRIMARY KEY,
    url_hash VARCHAR(191) NOT NULL,
    url TEXT NOT NULL,
    brand_id INTEGER REFERENCES brands(id),
    name VARCHAR(191) NOT NULL,
    description TEXT,
    press_release TEXT,
    photos TEXT, -- MariaDB longtext maps better to TEXT in PG
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Engines Table
CREATE TABLE IF NOT EXISTS engines (
    id SERIAL PRIMARY KEY,
    other_id BIGINT NOT NULL,
    automobile_id INTEGER REFERENCES automobiles(id),
    name VARCHAR(191) NOT NULL,
    specs TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create index for catalog generation
CREATE INDEX IF NOT EXISTS idx_engines_automobile_id ON engines(automobile_id);
CREATE INDEX IF NOT EXISTS idx_automobiles_brand_id ON automobiles(brand_id);
