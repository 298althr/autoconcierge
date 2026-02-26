-- ============================================================
-- SQL Evolution: Auction System Growth Model
-- Responsibility: Escrow Atomicity & Forensic Certification
-- ============================================================

-- 1. Extend Auction Status
-- Note: Dropping and re-creating the check constraint for status
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_status_check;
ALTER TABLE auctions ADD CONSTRAINT auctions_status_check 
CHECK (status IN (
    'draft', 'scheduled', 'live', 'ended', 'settled', 'unsold', 'cancelled',
    'buy_now_locked', 'sold_pending_70', 'sold_pending_validation', 'awaiting_final_payment'
));

-- 2. Create Escrow Ledger
CREATE TABLE IF NOT EXISTS auction_escrow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    seller_id UUID REFERENCES users(id) NOT NULL,
    total_deal_amount DECIMAL(15,2) NOT NULL,
    held_amount DECIMAL(15,2) DEFAULT 0,
    stage VARCHAR(30) DEFAULT 'commitment_10' 
        CHECK (stage IN ('commitment_10', 'escrow_70', 'final_100', 'completed', 'refunded')),
    status VARCHAR(30) DEFAULT 'active'
        CHECK (status IN ('active', 'disputed', 'released', 'refunded', 'cancelled')),
    dispute_meta JSONB, -- Stores reasons/categories
    seller_payout_amount DECIMAL(15,2),
    commission_amount DECIMAL(15,2),
    buyer_validation_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicle Certification Data (Step 2 Prep)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS certification_media JSONB;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS certification_score DECIMAL(5,2);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS certification_status VARCHAR(20) DEFAULT 'unverified'
    CHECK (certification_status IN ('unverified', 'pending', 'certified', 'flagged'));

-- 4. Linking Transactions to Escrow
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES auction_escrow(id);

-- 5. Extend Transaction Type Check
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
    'funding', 'withdrawal', 'bid_hold', 'bid_release',
    'auction_payment', 'commission', 'refund',
    'escrow_hold', 'escrow_release', 'escrow_refund'
));

-- 6. Add Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_auction ON auction_escrow(auction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON auction_escrow(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON auction_escrow(status);
