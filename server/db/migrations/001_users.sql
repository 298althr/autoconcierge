-- ============================================================
-- TABLE 1: users
-- Responsibility: Authentication + wallet + role
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  phone          VARCHAR(20),
  display_name   VARCHAR(100),
  role           VARCHAR(20) NOT NULL DEFAULT 'user'
                 CHECK (role IN ('user', 'admin')),
  avatar_url     TEXT,
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  held_amount    DECIMAL(15,2) DEFAULT 0.00,  -- sum of active bid holds
  email_verified BOOLEAN DEFAULT false,
  kyc_status     VARCHAR(20) DEFAULT 'none'
                 CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
  kyc_data       JSONB DEFAULT '{}',           -- { gov_id_url, selfie_url, submitted_at }
  is_active      BOOLEAN DEFAULT true,
  failed_login_attempts INT DEFAULT 0,
  locked_until   TIMESTAMP,
  last_login_at  TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
