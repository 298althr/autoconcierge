-- ============================================================
-- TABLE 8: valuations
-- Responsibility: AI market valuation cache
-- ============================================================
CREATE TABLE IF NOT EXISTS valuations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make             VARCHAR(50) NOT NULL,
  model            VARCHAR(100) NOT NULL,
  year             INT NOT NULL,
  condition        VARCHAR(30),
  mileage_km       INT,
  email            VARCHAR(255),
  result           JSONB NOT NULL,    -- full structured report from Groq
  created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_valuations_criteria ON valuations(make, model, year, condition);
