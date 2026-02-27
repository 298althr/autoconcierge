-- ============================================================
-- TABLE: vehicle_documents
-- Responsibility: Secure storage of mandatory asset documentation
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    doc_type      VARCHAR(30) NOT NULL 
                  CHECK (doc_type IN ('vin_proof', 'customs_duty', 'ownership_title', 'registration_card')),
    doc_url       TEXT NOT NULL,
    status        VARCHAR(20) DEFAULT 'pending' 
                  CHECK (status IN ('pending', 'verified', 'rejected')),
    reviewer_id   UUID REFERENCES users(id),
    review_notes  TEXT,
    uploaded_at   TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Update vehicles table to support registration workflow
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS registration_status VARCHAR(25) DEFAULT 'draft'
CHECK (registration_status IN ('draft', 'pending_validation', 'verified', 'rejected'));

-- Ensure VIN is mandatory for verification
ALTER TABLE vehicles ALTER COLUMN vin SET NOT NULL;

-- Indices
CREATE INDEX IF NOT EXISTS idx_vdoc_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_status);
