-- ============================================================
-- TABLE: vehicle_ownership_transfers
-- Responsibility: Formal audit trail of asset relocation
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_ownership_transfers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    previous_owner_id UUID REFERENCES users(id), -- NULL if from platform stock
    new_owner_id      UUID NOT NULL REFERENCES users(id),
    auction_id        UUID REFERENCES auctions(id),
    escrow_id         UUID REFERENCES auction_escrow(id),
    sale_price        DECIMAL(15,2) NOT NULL,
    transfer_type     VARCHAR(20) DEFAULT 'sale' 
                      CHECK (transfer_type IN ('sale', 'gift', 'admin_assignment')),
    transfer_date     TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_vot_vehicle ON vehicle_ownership_transfers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vot_new_owner ON vehicle_ownership_transfers(new_owner_id);

-- Add missing constraints or info to existing vehicles if needed
-- This ensures 'vin' and 'location' are prioritized in future updates
COMMENT ON COLUMN vehicles.vin IS 'Unique 17-character Vehicle Identification Number';
COMMENT ON COLUMN vehicles.location IS 'Geographic location of the asset for logistics';
