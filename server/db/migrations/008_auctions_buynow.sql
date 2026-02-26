-- Add buy_now_price to auctions and set default deposit_pct to 10%
ALTER TABLE auctions ADD COLUMN buy_now_price DECIMAL(15,2);
ALTER TABLE auctions ALTER COLUMN deposit_pct SET DEFAULT 10.00;
UPDATE auctions SET deposit_pct = 10.00 WHERE deposit_pct = 20.00;
