-- ============================================================
-- TABLE 3: vehicles
-- Responsibility: Physical inventory — actual cars
-- Admin creates. Users buy via auctions.
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id   UUID REFERENCES vehicle_catalog(id),
  owner_id     UUID REFERENCES users(id),         -- null = platform inventory
  listed_by    UUID REFERENCES users(id),          -- admin who listed
  vin          VARCHAR(17) UNIQUE,
  year         INT NOT NULL,
  make         VARCHAR(50) NOT NULL,
  model        VARCHAR(100) NOT NULL,
  trim         VARCHAR(50),
  condition    VARCHAR(20) DEFAULT 'clean'
               CHECK (condition IN ('clean', 'foreign_used', 'nigerian_used', 'salvage')),
  mileage_km   INT,
  color        VARCHAR(30),
  price        DECIMAL(15,2),
  status       VARCHAR(25) DEFAULT 'available'
               CHECK (status IN (
                 'available', 'in_auction', 'pending_payment', 'sold', 'archived'
               )),
  images       JSONB DEFAULT '[]',
  features     JSONB DEFAULT '[]',
  damage_report JSONB DEFAULT '{}',
  trust_score  INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  featured     BOOLEAN DEFAULT false,
  location     VARCHAR(100),
  history_log  JSONB DEFAULT '[]',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
