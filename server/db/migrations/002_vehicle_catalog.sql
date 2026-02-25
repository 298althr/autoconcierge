-- ============================================================
-- TABLE 2: vehicle_catalog
-- Responsibility: Reference data — makes, models, specs
-- Pre-seeded. Users never write to this.
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_catalog (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make                VARCHAR(50) NOT NULL,
  model               VARCHAR(100) NOT NULL,
  year_start          INT NOT NULL,
  year_end            INT,
  trim                VARCHAR(50),
  body_type           VARCHAR(30),
  engine_code         VARCHAR(30),
  displacement_cc     INT,
  horsepower          INT,
  torque_nm           INT,
  transmission        VARCHAR(30),
  drivetrain          VARCHAR(10),
  fuel_type           VARCHAR(20),
  specs               JSONB DEFAULT '{}',
  price_foreign_used  DECIMAL(15,2),
  price_nigerian_used DECIMAL(15,2),
  price_brand_new     DECIMAL(15,2),
  clearing_cost_est   DECIMAL(15,2),
  resell_rank         INT CHECK (resell_rank BETWEEN 1 AND 10),
  popularity_index    INT,
  created_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_catalog_make_model ON vehicle_catalog(make, model);
CREATE INDEX IF NOT EXISTS idx_catalog_year ON vehicle_catalog(year_start, year_end);
