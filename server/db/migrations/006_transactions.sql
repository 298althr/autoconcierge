-- ============================================================
-- TABLE 6: transactions
-- Responsibility: Financial ledger — all money movement
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) NOT NULL,
  type           VARCHAR(30) NOT NULL
                 CHECK (type IN (
                   'funding', 'withdrawal', 'bid_hold', 'bid_release',
                   'auction_payment', 'commission', 'refund'
                 )),
  amount         DECIMAL(15,2) NOT NULL,
  balance_after  DECIMAL(15,2),
  reference_id   UUID,
  reference_type VARCHAR(30),
  paystack_ref   VARCHAR(100) UNIQUE,
  status         VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  description    TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_paystack ON transactions(paystack_ref);
