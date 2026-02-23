-- ============================================================
-- TABLE 5: bids
-- Responsibility: Immutable bid ledger
-- ============================================================
CREATE TABLE IF NOT EXISTS bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID REFERENCES auctions(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  is_platform_bid BOOLEAN DEFAULT false,
  is_winning      BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_winning ON bids(auction_id, is_winning);
