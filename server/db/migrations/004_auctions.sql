-- ============================================================
-- TABLE 4: auctions
-- Responsibility: One auction per vehicle at a time
-- ============================================================
CREATE TABLE IF NOT EXISTS auctions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) NOT NULL UNIQUE,
  created_by      UUID REFERENCES users(id) NOT NULL,
  winner_id       UUID REFERENCES users(id),
  status          VARCHAR(20) DEFAULT 'scheduled'
                  CHECK (status IN (
                    'draft', 'scheduled', 'live', 'ended',
                    'settled', 'unsold', 'cancelled'
                  )),
  start_price     DECIMAL(15,2) NOT NULL,
  reserve_price   DECIMAL(15,2),
  current_price   DECIMAL(15,2),
  bid_increment   DECIMAL(15,2) DEFAULT 50000.00,
  deposit_pct     DECIMAL(5,2) DEFAULT 20.00,
  commission_rate DECIMAL(5,4) DEFAULT 0.0500,
  start_time      TIMESTAMP NOT NULL,
  end_time        TIMESTAMP NOT NULL,
  original_end    TIMESTAMP,
  bid_count       INT DEFAULT 0,
  bidder_count    INT DEFAULT 0,
  snipe_extensions INT DEFAULT 0,
  settled_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_vehicle ON auctions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_auctions_end ON auctions(end_time);
