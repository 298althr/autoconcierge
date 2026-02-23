-- ============================================================
-- TABLE 7: admin_audit_log
-- Responsibility: Immutable log of all admin actions
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES users(id) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),
  target_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  reason      TEXT,
  ip_address  INET,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
