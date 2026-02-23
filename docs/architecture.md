# AutoConcierge — Architecture
> Last updated: 2026-02-19 | Status: Locked for MVP

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT                  │
│              Next.js 14 (App Router + TypeScript)    │
│   ┌──────────┬────────────┬──────────────────────┐  │
│   │  Pages   │ Components │  Hooks / Context      │  │
│   │ (15 rtes)│ (UI Kit)   │ (useAuth, useAuction, │  │
│   │          │            │  useWallet, useSocket) │  │
│   └────┬─────┴─────┬──────┴──────────────────────┘  │
│        │ REST API  │ WebSocket (Socket.IO)            │
└────────┼───────────┼─────────────────────────────────┘
         │           │
         ▼           ▼
┌─────────────────────────────────────────────────────┐
│                    SERVER                            │
│             Express.js + Socket.IO (Node 20)        │
│  ┌──────────┬──────────────┬──────────────────────┐ │
│  │  Routes  │  Middleware  │     Services          │ │
│  │ auth     │ jwt verify   │ authService           │ │
│  │ vehicles │ rbac check   │ vehicleService        │ │
│  │ auctions │ rate limiter │ auctionService        │ │
│  │ bids     │ zod validate │ bidService            │ │
│  │ wallet   │ helmet/cors  │ walletService         │ │
│  │ valuations│ errorHandler│ valuationService      │ │
│  │ me       │             │ paystackService        │ │
│  │ admin    │             │ emailService           │ │
│  └────┬─────┴─────────────┴──────────────────────┘ │
│       │                                             │
│  ┌────▼─────────────────────────────────────────┐  │
│  │              PostgreSQL 16                   │  │
│  │  7 Tables + Indexes + Constraints            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  Cron Jobs (node-cron)                        │ │
│  │  - auctionCron: scheduled→live, live→ended   │ │
│  │  - settlementCron: 48hr timeout enforcement  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │            │            │
         ▼            ▼            ▼
   ┌──────────┐  ┌─────────┐  ┌──────────────┐
   │ Paystack │  │  Groq   │  │  Cloudinary  │
   │(payments)│  │  (AI)   │  │  (images)    │
   └──────────┘  └─────────┘  └──────────────┘
         │
         ▼
   ┌──────────┐
   │ SendGrid │
   │  (email) │
   └──────────┘
```

---

## 7 Core Systems

| # | System | Responsibility | Tables Used |
|---|--------|----------------|-------------|
| 1 | **Identity & Auth** | Registration, login, JWT, RBAC, password reset | `users` |
| 2 | **Vehicle Catalog** | Browse, search, filter, CRUD, images | `vehicle_catalog`, `vehicles` |
| 3 | **Auction Engine** | Create, state machine, timing, anti-snipe, row locking | `auctions`, `bids` |
| 4 | **Wallet & Payments** | Balance, fund, hold, settle, Paystack webhooks | `transactions`, `users.wallet_balance` |
| 5 | **AI Valuation** | Groq integration, Zod validation, caching | `valuations` |
| 6 | **User Dashboard** | Profile, garage, bid history, KYC | `users`, `vehicles`, `bids` |
| 7 | **Admin Operations** | Metrics, user/vehicle/auction mgmt, audit | `admin_audit_log` |

---

## Database Schema (All 7 MVP Tables)

```sql
-- ============================================================
-- TABLE 1: users
-- Responsibility: Authentication + wallet + role
-- ============================================================
CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- TABLE 2: vehicle_catalog
-- Responsibility: Reference data — makes, models, specs
-- Pre-seeded. Users never write to this.
-- ============================================================
CREATE TABLE vehicle_catalog (
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
CREATE INDEX idx_catalog_make_model ON vehicle_catalog(make, model);
CREATE INDEX idx_catalog_year ON vehicle_catalog(year_start, year_end);

-- ============================================================
-- TABLE 3: vehicles
-- Responsibility: Physical inventory — actual cars
-- Admin creates. Users buy via auctions.
-- ============================================================
CREATE TABLE vehicles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id   UUID REFERENCES vehicle_catalog(id),
  owner_id     UUID REFERENCES users(id),         -- null = platform inventory
  listed_by    UUID REFERENCES users(id),          -- admin who listed
  vin          VARCHAR(17) UNIQUE,
  year         INT NOT NULL,
  make         VARCHAR(50) NOT NULL,               -- denormalized for fast queries
  model        VARCHAR(100) NOT NULL,              -- denormalized for fast queries
  trim         VARCHAR(50),
  condition    VARCHAR(20) DEFAULT 'clean'
               CHECK (condition IN ('clean', 'foreign_used', 'nigerian_used', 'salvage')),
  mileage_km   INT,
  color        VARCHAR(30),
  price        DECIMAL(15,2),
  status       VARCHAR(25) DEFAULT 'available'
               CHECK (status IN (
                 'available', 'in_auction', 'pending_payment', 'sold', 'archived'
               )),
  images       JSONB DEFAULT '[]',                 -- array of Cloudinary URLs
  features     JSONB DEFAULT '[]',
  damage_report JSONB DEFAULT '{}',
  trust_score  INT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  featured     BOOLEAN DEFAULT false,
  location     VARCHAR(100),
  history_log  JSONB DEFAULT '[]',                 -- append-only event log
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
-- Full-text search index
CREATE INDEX idx_vehicles_search ON vehicles
  USING gin(to_tsvector('english', make || ' ' || model || ' ' || COALESCE(trim, '')));

-- ============================================================
-- TABLE 4: auctions
-- Responsibility: One auction per vehicle at a time
-- ============================================================
CREATE TABLE auctions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) NOT NULL UNIQUE, -- 1:1
  created_by      UUID REFERENCES users(id) NOT NULL,
  winner_id       UUID REFERENCES users(id),
  status          VARCHAR(20) DEFAULT 'scheduled'
                  CHECK (status IN (
                    'draft', 'scheduled', 'live', 'ended',
                    'settled', 'unsold', 'cancelled'
                  )),
  start_price     DECIMAL(15,2) NOT NULL,
  reserve_price   DECIMAL(15,2),
  current_price   DECIMAL(15,2),
  bid_increment   DECIMAL(15,2) DEFAULT 50000.00,
  deposit_pct     DECIMAL(5,2) DEFAULT 20.00,
  commission_rate DECIMAL(5,4) DEFAULT 0.0500,
  start_time      TIMESTAMP NOT NULL,
  end_time        TIMESTAMP NOT NULL,
  original_end    TIMESTAMP,                       -- tracks pre-extension end time
  bid_count       INT DEFAULT 0,
  bidder_count    INT DEFAULT 0,
  snipe_extensions INT DEFAULT 0,                  -- max 3
  settled_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_vehicle ON auctions(vehicle_id);
CREATE INDEX idx_auctions_end ON auctions(end_time);

-- ============================================================
-- TABLE 5: bids
-- Responsibility: Immutable bid ledger
-- ============================================================
CREATE TABLE bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID REFERENCES auctions(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  is_platform_bid BOOLEAN DEFAULT false,
  is_winning      BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bids_auction ON bids(auction_id, created_at DESC);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_bids_winning ON bids(auction_id, is_winning);

-- ============================================================
-- TABLE 6: transactions
-- Responsibility: Financial ledger — all money movement
-- ============================================================
CREATE TABLE transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) NOT NULL,
  type           VARCHAR(30) NOT NULL
                 CHECK (type IN (
                   'funding', 'withdrawal', 'bid_hold', 'bid_release',
                   'auction_payment', 'commission', 'refund'
                 )),
  amount         DECIMAL(15,2) NOT NULL,
  balance_after  DECIMAL(15,2),
  reference_id   UUID,                             -- auction_id, bid_id, etc.
  reference_type VARCHAR(30),                      -- 'auction', 'bid', etc.
  paystack_ref   VARCHAR(100) UNIQUE,              -- prevents duplicate processing
  status         VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  description    TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_paystack ON transactions(paystack_ref);

-- ============================================================
-- TABLE 7: admin_audit_log
-- Responsibility: Immutable log of all admin actions
-- NO DELETES EVER. Append-only.
-- ============================================================
CREATE TABLE admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES users(id) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),                         -- 'user', 'vehicle', 'auction'
  target_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  reason      TEXT,
  ip_address  INET,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_action ON admin_audit_log(action);
```

---

## State Machines

### Vehicle Status
```
available → in_auction → pending_payment → sold
    ↓                         ↓
 archived              (48hr timeout → available)
```

### Auction Status
```
draft → scheduled → live → ended → settled
                      ↓       ↓
                  cancelled  unsold → (vehicle → available)
```

### Bid Deposit Flow
```
bid placed → hold from wallet (bid_hold txn)
outbid     → release hold (bid_release txn)
auction won → hold converts to auction_payment
```

---

## Security Layers

```
Request
  → Rate Limiter (express-rate-limit: per IP + per user)
  → Helmet (security headers: CSP, HSTS, XSS protection)
  → CORS (whitelist: CORS_ORIGINS env var)
  → JWT Verification (auth middleware — checks Bearer token)
  → Role Authorization (roles middleware — checks req.user.role)
  → Zod Input Validation (validate middleware — per-route schema)
  → Business Logic (service layer — domain rules)
  → Parameterized Queries (no string concatenation SQL)
  → Response (password_hash, kyc_data stripped from all outputs)
```

---

## Cron Job Schedule

| Job | Schedule | Trigger |
|-----|----------|---------|
| `activateAuctions` | Every 1 minute | scheduled → live when start_time ≤ NOW() |
| `endAuctions` | Every 1 minute | live → ended when end_time ≤ NOW() |
| `processSettlementTimeouts` | Every 15 minutes | 48hr deadline exceeded → re-list vehicle |

---

## Monorepo Folder Structure

```
AutoConcierge/
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Landing
│   │   │   ├── vehicles/
│   │   │   │   ├── page.tsx            # Browse
│   │   │   │   └── [id]/page.tsx       # Detail
│   │   │   ├── valuation/page.tsx      # AI Valuation
│   │   │   ├── auctions/[id]/page.tsx  # Auction Room
│   │   │   ├── garage/page.tsx         # My Garage
│   │   │   ├── wallet/page.tsx         # My Wallet
│   │   │   ├── profile/page.tsx        # Profile
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx            # Dashboard
│   │   │       ├── vehicles/page.tsx
│   │   │       ├── auctions/page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── transactions/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                     # Button, Input, Card, Modal, Badge, Skeleton, Toast
│   │   │   ├── vehicle/                # VehicleCard, VehicleGallery, TrustScoreBadge
│   │   │   ├── auction/                # BidPanel, AuctionTimer, BidFeed, BidConfirmModal
│   │   │   ├── wallet/                 # BalanceCard, FundWalletModal, TransactionRow
│   │   │   └── layout/                 # Navbar, Footer, AdminSidebar
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAuction.ts
│   │   │   ├── useWallet.ts
│   │   │   └── useSocket.ts
│   │   ├── lib/
│   │   │   ├── api.ts                  # Fetch wrapper with auto-refresh
│   │   │   ├── socket.ts               # Socket.IO client singleton
│   │   │   └── auth.ts                 # Auth context + guards
│   │   └── styles/
│   │       └── globals.css             # Design tokens (CSS custom props + Tailwind base)
│   ├── public/
│   ├── tailwind.config.ts              # Extends design tokens
│   ├── next.config.js
│   └── package.json
│
├── server/
│   ├── index.js                        # Express + Socket.IO entry
│   ├── config/
│   │   ├── database.js                 # pg Pool (20 connections)
│   │   └── env.js                      # dotenv + validation
│   ├── middleware/
│   │   ├── auth.js                     # JWT verify → req.user
│   │   ├── roles.js                    # RBAC by role array
│   │   ├── validate.js                 # Zod schema runner
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── auctions.js
│   │   ├── bids.js
│   │   ├── wallet.js
│   │   ├── valuations.js
│   │   ├── me.js
│   │   └── admin.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── vehicleService.js
│   │   ├── auctionService.js
│   │   ├── bidService.js
│   │   ├── walletService.js
│   │   ├── valuationService.js
│   │   ├── settlementService.js
│   │   ├── paystackService.js
│   │   ├── emailService.js
│   │   └── socketService.js
│   ├── jobs/
│   │   ├── auctionCron.js
│   │   └── settlementCron.js
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_users.sql
│   │   │   ├── 002_vehicle_catalog.sql
│   │   │   ├── 003_vehicles.sql
│   │   │   ├── 004_auctions.sql
│   │   │   ├── 005_bids.sql
│   │   │   ├── 006_transactions.sql
│   │   │   └── 007_admin_audit_log.sql
│   │   ├── migrate.js                  # Runs all migrations in order
│   │   └── seeds/
│   │       ├── catalog_seed.js         # Vehicle catalog (from open-source data)
│   │       └── demo_seed.js            # Test vehicles + admin user
│   └── utils/
│       ├── logger.js
│       └── helpers.js
│
├── docs/                               # All documentation
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json                        # Root workspace scripts
└── README.md
```
