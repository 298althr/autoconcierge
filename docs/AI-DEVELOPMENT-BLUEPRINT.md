# AI-Ready Development Blueprint
## VantagePoint (Dealer360 v2.0) — February 2026

> **Purpose:** This document is the single input document for any AI coding agent, junior developer, or contractor working on VantagePoint. It eliminates ambiguity, defines exact scope, and prevents scope hallucination.
>
> **Rule:** If it's not in this document, it doesn't get built.

---

## 1️⃣ Product Definition (Non-Negotiable)

### Who Is the User?

| User Type | Description | Access Level |
|-----------|-------------|--------------|
| **Buyer (Guest)** | Anyone browsing the platform. Can view vehicles, use AI valuation. Cannot bid. | Public pages only |
| **Buyer (Authenticated)** | Registered user with funded wallet. Can bid in auctions, own vehicles. | Dashboard, auctions, wallet |
| **Verified Seller** | Authenticated user who passed KYC. Can list vehicles for auction. | Vehicle listing, auction creation request |
| **Dealer** | Business account. Can list multiple vehicles, access bulk tools. | Dealer dashboard, bulk listing |
| **Concierge** | Internal staff. Handles user requests, task routing. | Concierge panel (Post-MVP) |
| **Manager** | Senior admin. Revenue controls, commission management, analytics. | Full admin panel |
| **Admin (Super)** | Platform owner. Full system access. User/auction/financial management. | Everything |

**MVP users:** Buyer (Guest), Buyer (Authenticated), Admin. That's it. Dealer and Concierge are post-MVP.

### What Problem Is Solved?

Nigeria's used car market is:
- **Opaque** — No reliable pricing data. Buyers overpay by 15-30%
- **Trust-deficient** — No vehicle history, no verified sellers, frequent fraud
- **Fragmented** — Deals happen via WhatsApp, Instagram, and word-of-mouth with no platform accountability
- **Inefficient** — Finding, pricing, and purchasing a car takes 2-6 weeks

**VantagePoint solves this by:**
1. Providing AI-powered market valuations so buyers know the fair price instantly
2. Running transparent, timed auctions with real-time bidding
3. Managing the full transaction lifecycle (bid → win → pay → own) inside one platform
4. Building trust through vehicle trust scores, verified listings, and escrow-style wallet payments

### What the MVP Includes (Exhaustive)

Everything below ships in MVP. Nothing else does.

1. **User Authentication** (email/password, JWT)
2. **Vehicle Catalog** (browse, search, filter, detail pages)
3. **AI Valuation Tool** (Groq-powered market intelligence)
4. **Live Timed Auctions** (real-time bidding via WebSocket)
5. **Wallet System** (fund via Paystack, hold deposits, settle)
6. **Post-Auction Settlement** (winner pays balance, vehicle transfers)
7. **User Dashboard** (overview, garage, bid history, profile)
8. **Admin Panel** (create auctions, view revenue, manage users)

### What Is NOT Included (Explicitly Deferred)

| Feature | Why It's Out | When It Comes In |
|---------|--------------|------------------|
| 3D Garage / Spatial Commerce | Not revenue-critical, +4 weeks | Phase 4 (Week 19+) |
| Concierge Chat System | Manual via WhatsApp for now | Phase 3 (Week 13+) |
| Service Request Marketplace | Needs partner network | Phase 2 (Week 8+) |
| Partner Portal | Admin panel handles partners initially | Phase 2 |
| Multi-LLM Orchestration | Groq alone is sufficient | Phase 3 |
| Import/Clearing Orchestration | Manual process works | Phase 4 |
| Enterprise B2B Data API | Zero customers yet | Phase 4 |
| Push Notifications / PWA | Email is enough for MVP volume | Phase 2 |
| Phone OTP Authentication | Email auth sufficient | Phase 2 |
| Advanced Analytics Dashboard | Basic SQL queries + admin panel sufficient | Phase 3 |
| Vehicle Embeddings / Recommendations | Pgvector added when recommendation engine is built | Phase 4 |
| Insurance Integration | Requires partnerships | Phase 5 |
| Government API Integrations | Requires partnerships | Phase 5 |

---

## 2️⃣ Feature List (Granular & Atomic)

Every feature below is broken into implementable units. Each bullet = one task.

### 2.1 Authentication & Identity

- [ ] **Registration:** Email + password form. Validate email format, enforce password min 8 chars (1 uppercase, 1 number). Hash with bcrypt (12 rounds). Store in `users` table.
- [ ] **Login:** Email + password. Compare bcrypt hash. Return JWT access token (15min) + refresh token (7 days). Set refresh token as httpOnly cookie.
- [ ] **Token Refresh:** `POST /api/auth/refresh`. Verify refresh token from cookie. Issue new access token. Reject expired/invalid tokens.
- [ ] **Logout:** Clear refresh token cookie. Invalidate token server-side (add to blacklist until expiry).
- [ ] **Protected Route Middleware:** Verify JWT from `Authorization: Bearer <token>` header. Attach `req.user` with `{ id, role, email }`. Return 401 if missing/invalid.
- [ ] **Role-Based Access Control (RBAC):** Middleware that checks `req.user.role` against allowed roles array. Returns 403 if unauthorized. Roles: `user`, `admin`.
- [ ] **Password Reset:** `POST /api/auth/forgot-password` → generate reset token (UUID), store hashed in DB with 1hr expiry, send email with reset link. `POST /api/auth/reset-password` → verify token, update password hash, invalidate token.
- [ ] **Email Verification:** On registration, send verification email with token link. `GET /api/auth/verify/:token` → set `email_verified = true`. Block bidding until verified.
- [ ] **Session Security:** Rate limit login to 5 attempts per 15 min per IP. Log failed attempts. Lock account after 10 consecutive failures.

### 2.2 Vehicle Catalog

- [ ] **List Vehicles:** `GET /api/vehicles` — Paginated (20/page), sortable (price, year, date_listed), filterable (make, model, year_range, price_range, condition, body_type). Return vehicle + joined catalog specs.
- [ ] **Search Vehicles:** Full-text search on `make || model || trim` using PostgreSQL `to_tsvector`. Support partial match. Debounced on frontend (300ms).
- [ ] **Vehicle Detail:** `GET /api/vehicles/:id` — Return full vehicle record + catalog specs (engine, horsepower, torque, transmission). Include image URLs, trust score, current market prices from catalog.
- [ ] **Vehicle Images:** Store image URLs in `vehicles.images` JSONB array. Images uploaded to Cloudinary. Max 10 images per vehicle. Return optimized URLs (w=800, q=80).
- [ ] **Create Vehicle (Admin):** `POST /api/vehicles` — Admin-only. Required: catalog_id, year, condition, price, images. Optional: vin, mileage_km, color, features, damage_report. Validate catalog_id exists.
- [ ] **Update Vehicle (Admin):** `PATCH /api/vehicles/:id` — Admin-only. Partial update. Cannot change owner_id or catalog_id after creation.
- [ ] **Vehicle Status Management:** Statuses: `available`, `in_auction`, `sold`, `reserved`, `delisted`. Status transitions enforced server-side. `available` → `in_auction` only when auction created. `in_auction` → `sold` only on auction settlement.
- [ ] **Featured Vehicles:** `GET /api/vehicles/featured` — Return top 6 vehicles where `featured = true` OR highest trust_score. Used on landing page.

### 2.3 AI Valuation Tool

- [ ] **Valuation Request:** `POST /api/valuation` — Accept: `{ make, model, year, condition?, mileage_km?, email }`. Email required (lead capture). Rate limit: 5 requests per email per hour.
- [ ] **Groq Integration:** Send structured prompt to Groq (Llama 3.1 70B). Prompt includes: Nigerian market context, Tokunbo/Nigerian-used/brand-new price tiers, seasonal factors, clearing costs.
- [ ] **Valuation Response:** Return structured JSON: `{ price_tokunbo, price_nigerian_used, price_brand_new, clearing_cost_estimate, investment_score (1-10), recommendation ("Buy" | "Hold" | "Sell"), market_trend, confidence_level }`.
- [ ] **Caching:** Cache valuation results by `make+model+year+condition` key for 24 hours. Serve cached result if available instead of calling Groq API.
- [ ] **Error Handling:** If Groq API fails: return cached result if available, otherwise return `{ error: "AI service temporarily unavailable", retry_after: 60 }`. Never expose API errors to client.
- [ ] **Valuation History:** Store each valuation request in a `valuation_log` (not a full table, just append to a JSONB log or simple table) for analytics.

### 2.4 Auction System

- [ ] **Create Auction (Admin):** `POST /api/auctions` — Required: vehicle_id, start_price, start_time, end_time. Optional: reserve_price, bid_increment (default ₦50,000), deposit_pct (default 20%). Set vehicle status to `in_auction`. Validate: vehicle exists, status is `available`, start_time > now, end_time > start_time.
- [ ] **List Auctions:** `GET /api/auctions` — Return active (status = `live`) and upcoming (status = `scheduled`) auctions. Include vehicle summary + current price + bid count + time remaining.
- [ ] **Auction Detail:** `GET /api/auctions/:id` — Full auction data + vehicle detail + bid history (last 20 bids). Include WebSocket room ID for real-time connection.
- [ ] **Auction Status Machine:** Draft → Scheduled → Live → Ended → Settled. Transitions enforced server-side. Cron job or scheduled task checks: if `start_time <= now AND status = 'scheduled'` → set `live`. If `end_time <= now AND status = 'live'` → set `ended`, trigger settlement.
- [ ] **Place Bid:** `POST /api/auctions/:id/bid` — Validate: authenticated, auction is `live`, amount > current_price + bid_increment, user has sufficient wallet balance (>= deposit_pct of bid amount). Use `SELECT ... FOR UPDATE` row lock on auction to prevent race conditions. Update `current_price`, increment `bid_count`, set new bid as `is_winning = true`, set previous winning bid `is_winning = false`.
- [ ] **Real-time Bidding (Socket.IO):** On bid placed → broadcast to all room participants: `{ event: 'new_bid', data: { bidder_display_name, amount, bid_count, time_remaining } }`. On auction end → broadcast: `{ event: 'auction_ended', data: { winner_display_name, final_price } }`.
- [ ] **Anti-Sniping:** If bid placed within last 2 minutes of auction → extend `end_time` by 2 minutes. Max 3 extensions per auction. Update `original_end` to track original end time.
- [ ] **AI Reserve Protection:** If auction is about to end below reserve_price and there are active bidders → system places a platform bid at reserve_price. Set `is_platform_bid = true`. If no human outbids → auction ends as "reserve not met" and no sale occurs.
- [ ] **Deposit Hold:** When user places a bid → hold `deposit_pct` of bid amount from their wallet balance. Release hold if outbid. Winning bidder's hold converts to partial payment.
- [ ] **Auction End Processing:** When auction status → `ended`: identify winning bid, calculate platform commission (5% of final price), create settlement record, notify winner via email, set vehicle status to `reserved`.

### 2.5 Wallet & Payments

- [ ] **Get Wallet:** `GET /api/wallet` — Return: `{ balance, available_balance (balance - held_amount), held_amount, recent_transactions }`.
- [ ] **Fund Wallet:** `POST /api/wallet/fund` — Accept: `{ amount }`. Min ₦5,000. Max ₦10,000,000. Initialize Paystack transaction. Return Paystack authorization URL for frontend redirect.
- [ ] **Paystack Webhook:** `POST /api/wallet/webhook` — Verify webhook signature using `PAYSTACK_WEBHOOK_SECRET`. On `charge.success`: credit user wallet, create `transactions` record (type: `funding`, status: `completed`). Idempotent: check `paystack_ref` doesn't already exist.
- [ ] **Withdraw Funds:** `POST /api/wallet/withdraw` — Accept: `{ amount, bank_code, account_number }`. Min ₦1,000. Max available_balance. Create Paystack transfer. Create `transactions` record (type: `withdrawal`, status: `pending`). Handle Paystack transfer webhook for completion/failure.
- [ ] **Transaction History:** `GET /api/wallet/transactions` — Paginated. Types: `funding`, `withdrawal`, `bid_hold`, `bid_release`, `auction_payment`, `commission`. Include reference_type and reference_id for linking to auctions/bids.
- [ ] **Balance Integrity:** All balance mutations happen inside PostgreSQL transactions. `wallet_balance` is updated with `SET wallet_balance = wallet_balance + $amount` (atomic). Never read balance → calculate → write (race condition).

### 2.6 Post-Auction Settlement

- [ ] **Winner Notification:** When auction ends → send email to winner with: vehicle details, winning bid amount, remaining balance due, 48-hour payment deadline.
- [ ] **Complete Payment:** `POST /api/settlement/:auctionId/pay` — Winner pays remaining balance (winning_bid - deposit_already_held). Deduct from wallet. Create transaction record. Update auction status to `settled`.
- [ ] **Vehicle Transfer:** On settlement complete → update `vehicles.owner_id` to winner's user_id. Update `vehicles.status` to `sold`. Vehicle now appears in winner's garage.
- [ ] **Commission Recording:** On settlement → create transaction for platform commission (type: `commission`). Amount = `final_price * commission_rate`. Log in `admin_audit_log`.
- [ ] **Payment Timeout:** If winner doesn't pay within 48 hours → release deposit back to winner's wallet, re-list vehicle as `available`, notify admin. Option to offer to second-highest bidder.

### 2.7 User Dashboard

- [ ] **Dashboard Overview:** `GET /api/me` + aggregated data. Show: wallet balance, count of active bids, count of owned vehicles, recent activity feed (last 5 actions).
- [ ] **My Garage:** `GET /api/me/garage` — List all vehicles where `owner_id = current_user`. Show: image, make/model/year, current market value (from catalog), date acquired. Click → vehicle detail page.
- [ ] **My Bids:** `GET /api/me/bids` — List all bids by user. Include auction status, whether bid is winning. Tabs: Active (auction still live), Won (settled), Lost (outbid/ended). Click → auction detail/result.
- [ ] **Profile Edit:** `PATCH /api/me` — Update: display_name, phone, avatar_url (Cloudinary upload). Cannot change email (requires verification flow).
- [ ] **KYC Submission:** `POST /api/me/kyc` — Upload: government ID image (Cloudinary), selfie image. Admin manually reviews. Status: `none` → `pending` → `verified` | `rejected`. KYC required for: selling vehicles, withdrawals > ₦500,000.

### 2.8 Admin Panel

- [ ] **Admin Dashboard:** Revenue total (sum of commission transactions), active auctions count, total users count, recent settlements. Date range filter.
- [ ] **User Management:** List users (paginated, searchable by email/name). View user detail: balance, bid history, owned vehicles, KYC status. Actions: activate/deactivate user, verify KYC.
- [ ] **Auction Management:** Create auction, approve/reject auction requests, monitor live auctions (bid count, current price), manually end auction (emergency), view settlement status.
- [ ] **Vehicle Management:** List all vehicles. Filter by status. Edit vehicle details. Delist vehicle. Mark as featured.
- [ ] **Audit Log:** Every admin action logged: `{ admin_id, action, target_type, target_id, old_value, new_value, timestamp, ip_address }`. Viewable in admin panel. Cannot be deleted.

---

## 3️⃣ System Architecture Decision

### Confirmed Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend** | Next.js (App Router) | 14.x | SSR for SEO on vehicle pages, RSC for performance, large ecosystem |
| **Styling** | Tailwind CSS | 3.x | Rapid iteration, consistent design tokens, mobile-first utilities |
| **Backend API** | Express.js on Node.js | Node 20 LTS | Fast development, shared JS ecosystem with frontend, async I/O |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSONB for flexible fields, row-level locking for bids |
| **Real-time** | Socket.IO | 4.x | WebSocket with automatic HTTP long-polling fallback |
| **Payments** | Paystack | API v2 | Nigerian market leader, 1.5% transaction fee, well-documented |
| **AI/LLM** | Groq (Llama 3.1 70B) | Latest | Fastest inference (~500ms), generous free tier, structured output |
| **Image Storage** | Cloudinary | Latest | Auto-optimization, transformation URLs, 25GB free tier |
| **Hosting** | Render.com | — | Simple deploy, managed PostgreSQL, free SSL, $7/mo base |
| **Email** | SendGrid | v3 | Transactional emails, 100/day free tier |

### What Is NOT Used (and Why)

| Technology | Why Not |
|-----------|---------|
| Redis | PostgreSQL handles sessions at MVP volume. Add when >1000 concurrent users |
| MongoDB | JSONB columns handle flexible data. One database = simpler operations |
| Docker (production) | Render handles containerization. Docker only for local dev |
| Microservices | Monolith first. Split when you have proven scale problems |
| GraphQL | REST is simpler, faster to implement, sufficient for MVP data needs |
| Firebase Auth | Need control over auth flow, JWT customization, and no vendor lock-in |
| AWS S3 | Cloudinary provides S3-level storage + image optimization in one service |
| Kubernetes | Way overkill. Render handles scaling. Evaluate at 10,000+ users |

### Architecture Diagram (Monorepo)

```
┌─────────────────────────────────────────────┐
│                   CLIENT                     │
│         Next.js 14 (App Router)              │
│    ┌───────────┬──────────┬──────────┐       │
│    │  Pages    │Components│  Hooks   │       │
│    │ (15 routes)│ (UI kit) │(useAuth, │       │
│    │           │          │ useAuction│       │
│    │           │          │ useWallet)│       │
│    └─────┬─────┴────┬─────┴─────┬────┘       │
│          │ REST API  │ WebSocket │            │
└──────────┼──────────┼──────────┼─────────────┘
           │          │          │
           ▼          │          ▼
┌──────────────────────┼───────────────────────┐
│                SERVER│                        │
│         Express.js + │Socket.IO               │
│    ┌─────────┬───────┴──┬───────────┐        │
│    │ Routes  │Middleware │ Services  │        │
│    │ (auth,  │(jwt, rbac,│(auction,  │        │
│    │vehicles,│validation,│ bid,      │        │
│    │auctions,│rateLimit, │ wallet,   │        │
│    │wallet,  │errorHandler│ ai)      │        │
│    │admin)   │          │           │        │
│    └────┬────┴──────────┴─────┬─────┘        │
│         │                     │              │
│    ┌────▼─────────────────────▼────┐         │
│    │       PostgreSQL 16           │         │
│    │  7 tables (MVP) + migrations  │         │
│    └───────────────────────────────┘         │
└──────────────────────────────────────────────┘
           │              │
           ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Paystack │   │  Groq    │   │Cloudinary│
    │(payments)│   │  (AI)    │   │ (images) │
    └──────────┘   └──────────┘   └──────────┘
```

### Database Schema (7 MVP Tables)

```sql
-- 1. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user','admin')),         -- MVP: only 2 roles
  display_name VARCHAR(100),
  avatar_url TEXT,
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  email_verified BOOLEAN DEFAULT false,
  kyc_status VARCHAR(20) DEFAULT 'none'
    CHECK (kyc_status IN ('none','pending','verified','rejected')),
  kyc_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. vehicle_catalog (reference data, read-heavy)
CREATE TABLE vehicle_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_start INT NOT NULL,
  year_end INT,
  trim VARCHAR(50),
  body_type VARCHAR(30),
  engine_code VARCHAR(30),
  displacement_cc INT,
  horsepower INT,
  torque_nm INT,
  transmission VARCHAR(30),
  drivetrain VARCHAR(10),
  fuel_type VARCHAR(20),
  specs JSONB DEFAULT '{}',
  price_foreign_used DECIMAL(15,2),
  price_nigerian_used DECIMAL(15,2),
  price_brand_new DECIMAL(15,2),
  clearing_cost_est DECIMAL(15,2),
  resell_rank INT,
  popularity_index INT
);

-- 3. vehicles (physical inventory)
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID REFERENCES vehicle_catalog(id),
  owner_id UUID REFERENCES users(id),
  listed_by UUID REFERENCES users(id),
  vin VARCHAR(17) UNIQUE,
  year INT NOT NULL,
  condition VARCHAR(20) DEFAULT 'clean'
    CHECK (condition IN ('clean','foreign_used','nigerian_used','salvage')),
  mileage_km INT,
  color VARCHAR(30),
  price DECIMAL(15,2),
  status VARCHAR(25) DEFAULT 'available'
    CHECK (status IN ('available','in_auction','sold','reserved','delisted')),
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  damage_report JSONB DEFAULT '{}',
  trust_score INT DEFAULT 50,
  featured BOOLEAN DEFAULT false,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. auctions
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  winner_id UUID REFERENCES users(id),
  status VARCHAR(25) DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','live','ended','settled','cancelled')),
  start_price DECIMAL(15,2) NOT NULL,
  reserve_price DECIMAL(15,2),
  current_price DECIMAL(15,2),
  bid_increment DECIMAL(15,2) DEFAULT 50000,
  deposit_pct DECIMAL(5,2) DEFAULT 20.00,
  commission_rate DECIMAL(5,4) DEFAULT 0.0500,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  original_end TIMESTAMP,
  bid_count INT DEFAULT 0,
  bidder_count INT DEFAULT 0,
  snipe_extensions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. bids
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  is_platform_bid BOOLEAN DEFAULT false,
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_bids_auction ON bids(auction_id, created_at DESC);

-- 6. transactions (all money movement)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('funding','withdrawal','bid_hold','bid_release',
                    'auction_payment','commission','refund')),
  amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2),
  reference_id UUID,
  reference_type VARCHAR(30),
  paystack_ref VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);

-- 7. admin_audit_log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id, created_at DESC);
```

### API Route Map (Complete)

```
AUTH
  POST   /api/auth/register          → Create account (public)
  POST   /api/auth/login             → Get JWT tokens (public)
  POST   /api/auth/refresh           → Refresh access token (cookie)
  POST   /api/auth/logout            → Clear session (auth)
  POST   /api/auth/forgot-password   → Request reset email (public)
  POST   /api/auth/reset-password    → Set new password (token)
  GET    /api/auth/verify/:token     → Verify email (public)

VEHICLES
  GET    /api/vehicles               → List + filter + search (public)
  GET    /api/vehicles/featured      → Featured vehicles (public)
  GET    /api/vehicles/:id           → Full detail (public)
  POST   /api/vehicles               → Create vehicle (admin)
  PATCH  /api/vehicles/:id           → Update vehicle (admin)

AUCTIONS
  GET    /api/auctions               → List active/upcoming (public)
  GET    /api/auctions/:id           → Detail + bids (public)
  POST   /api/auctions               → Create auction (admin)
  POST   /api/auctions/:id/bid       → Place bid (auth + wallet)
  PATCH  /api/auctions/:id           → Update auction (admin)

WALLET
  GET    /api/wallet                 → Balance + txns (auth)
  POST   /api/wallet/fund            → Initiate Paystack (auth)
  POST   /api/wallet/withdraw        → Initiate withdrawal (auth)
  POST   /api/wallet/webhook         → Paystack webhook (Paystack IP)
  GET    /api/wallet/transactions    → Full txn history (auth)

AI
  POST   /api/valuation              → AI market valuation (email)

USER
  GET    /api/me                     → Current profile (auth)
  PATCH  /api/me                     → Update profile (auth)
  POST   /api/me/kyc                 → Submit KYC (auth)
  GET    /api/me/garage              → Owned vehicles (auth)
  GET    /api/me/bids                → Bid history (auth)

ADMIN
  GET    /api/admin/dashboard        → Revenue stats (admin)
  GET    /api/admin/users            → User list (admin)
  GET    /api/admin/users/:id        → User detail (admin)
  PATCH  /api/admin/users/:id        → Activate/deactivate (admin)
  PATCH  /api/admin/users/:id/kyc    → Approve/reject KYC (admin)
  GET    /api/admin/auctions         → All auctions (admin)
  POST   /api/admin/auctions/:id/end → Force-end auction (admin)
  GET    /api/admin/audit            → Audit log (admin)

SOCKET.IO EVENTS
  join_auction    → Client joins auction room
  leave_auction   → Client leaves auction room
  new_bid         → Server → all: new bid broadcast
  auction_ending  → Server → all: < 2 min warning
  auction_ended   → Server → all: final result
  bid_error       → Server → sender: bid validation failure
  connection_lost → Client handles reconnect (max 3 retries)
```

---

## 4️⃣ Bottlenecks & Decisions Requiring Human Input

These are areas where AI **cannot make the decision alone**. Each must be resolved before implementation begins.

### 🔴 Ambiguity in Product Requirements

| # | Question | Impact | Default If Unanswered |
|---|----------|--------|-----------------------|
| 1 | Can a buyer also sell vehicles, or are buyer/seller separate sign-up flows? | Registration flow, role assignment, dashboard design | Single account, user applies for seller verification via KYC |
| 2 | Is there a minimum bid amount, or just minimum increment above current price? | Bid validation logic | Minimum increment only (₦50,000 above current price) |
| 3 | What happens if the ONLY bidder is the platform's AI reserve bid? | Auction settlement logic | Auction ends as "reserve not met", vehicle re-listed |
| 4 | Can a vehicle be in multiple auctions simultaneously? | Vehicle status management | No. One auction at a time. Vehicle locked to `in_auction` |
| 5 | Is there a maximum number of active auctions at the same time? | System capacity, UI design | No limit in MVP, but admin manually controls schedule |

### 🔴 Undefined Edge Cases

| # | Edge Case | Current Decision (Override If Needed) |
|---|-----------|---------------------------------------|
| 1 | User's wallet is funded mid-auction (they were previously too low to bid) | Allow bidding immediately once balance sufficient |
| 2 | User places bid, then withdraws funds before auction ends | Deposit hold prevents this — hold is placed on bid |
| 3 | Paystack webhook arrives before the funding redirect confirms | Webhook is source of truth. Frontend polls until confirmed |
| 4 | Two bids arrive within same millisecond | `SELECT FOR UPDATE` row lock ensures serialization |
| 5 | User closes browser during auction — do they lose their bid? | No. Bid is server-side. They can reconnect and their bid stands |
| 6 | Admin force-ends an auction with active bids | Treat as normal end. Highest bidder wins. Settlement proceeds |
| 7 | Winner's account gets deactivated between winning and paying | Admin must manually resolve. Hold funds, flag for review |
| 8 | Vehicle images fail to upload to Cloudinary | Return error, do not create vehicle. Require at least 1 image |

### 🟡 UX Decisions (Subjective — Need Design Direction)

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Auction countdown display format | A) "2h 34m 12s" text B) Circular progress C) Linear bar | B) Circular progress — more visual urgency |
| 2 | Bid confirmation | A) One-click bid B) Confirm modal C) Slide to bid | B) Confirm modal — prevents accidental bids with real money |
| 3 | Vehicle gallery layout | A) Grid B) Carousel C) Full-width hero + thumbnails | C) Hero + thumbnails — premium feel, mobile-friendly |
| 4 | Wallet balance visibility | A) Always in navbar B) Only on wallet page C) Floating widget | A) Always visible — users need to know balance before bidding |
| 5 | Empty state for "My Garage" (no vehicles) | A) Plain text B) Illustration + CTA C) Featured vehicles | C) Show featured vehicles — drive auction engagement |
| 6 | Bid history in auction room | A) Show all bids B) Last 10 C) Only own bids + top bid | B) Last 10 — performance + readability balance |

### 🟡 Security Tradeoffs

| # | Decision | Options | Default |
|---|----------|---------|---------|
| 1 | JWT token storage on frontend | A) localStorage B) httpOnly cookie C) Memory + refresh cookie | C) Access token in memory, refresh in httpOnly cookie |
| 2 | Rate limiting strategy | A) Per IP B) Per user C) Both | C) Both — IP for unauthenticated, user for authenticated |
| 3 | Input sanitization | A) Sanitize on input B) Sanitize on output C) Both | C) Both — DOMPurify on input, escape on output |
| 4 | Admin panel access | A) Same domain B) Separate subdomain C) IP-restricted | A) Same domain with RBAC in MVP. Subdomain post-MVP |
| 5 | Paystack webhook verification | A) Signature check only B) Signature + IP whitelist | B) Both — Paystack publishes their IP ranges |

### 🟡 Performance Tradeoffs

| # | Decision | Options | Default |
|---|----------|---------|---------|
| 1 | Vehicle search | A) PostgreSQL full-text B) Elasticsearch C) Meilisearch | A) PostgreSQL — sufficient for <10K vehicles |
| 2 | Auction real-time updates | A) Polling (1s) B) WebSocket C) SSE | B) WebSocket via Socket.IO — bidirectional, fallback built-in |
| 3 | Image loading | A) Eager all B) Lazy load C) Blur placeholder + lazy | C) Blur-up placeholder — best perceived performance |
| 4 | API response caching | A) No cache B) CDN cache (5min) C) SWR on frontend | C) SWR for catalog pages, no cache for wallet/auction data |
| 5 | Database connection pooling | A) Default (10) B) Optimized (20-30) C) PgBouncer | B) Pool of 20 connections — sufficient for MVP scale |

### 🟡 Business Logic Conflicts

| # | Conflict | Resolution |
|---|----------|------------|
| 1 | Commission rate: fixed vs. variable | Fixed 5% for MVP. Variable rates per vehicle/auction type post-MVP |
| 2 | Deposit percentage: high (safer) vs. low (more bidders) | 20% default. Admin can adjust per auction (10-50% range) |
| 3 | Anti-sniping: aggressive (5min extension) vs. light (2min) | 2 minutes, max 3 extensions. Prevents marathon auctions |
| 4 | Payment deadline: short (24h) vs. generous (72h) | 48 hours. Long enough to arrange funds, short enough to keep inventory moving |
| 5 | KYC requirement for bidding | NOT required for bidding in MVP. Required for: selling, withdrawals > ₦500K |
| 6 | Minimum wallet balance to bid | Must have >= deposit_pct of bid amount in available balance |

---

## 5️⃣ Environment Variables (Complete)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/vantagepoint
DB_POOL_MIN=5
DB_POOL_MAX=20

# Authentication
JWT_ACCESS_SECRET=<random-64-char>
JWT_REFRESH_SECRET=<random-64-char>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# AI
GROQ_API_KEY=gsk_xxx
GROQ_MODEL=llama-3.1-70b-versatile

# File Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_UPLOAD_PRESET=vantagepoint_vehicles

# Email
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@dealer360.ng
SENDGRID_FROM_NAME=VantagePoint

# Application
APP_URL=https://dealer360.ng
API_URL=https://api.dealer360.ng
CORS_ORIGINS=https://dealer360.ng
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Auction Config
AUCTION_SNIPE_WINDOW_SECONDS=120
AUCTION_MAX_SNIPE_EXTENSIONS=3
DEFAULT_BID_INCREMENT=50000
DEFAULT_DEPOSIT_PCT=20
DEFAULT_COMMISSION_RATE=0.05
SETTLEMENT_DEADLINE_HOURS=48
```

---

## 6️⃣ Pre-Build Checklist

Before writing any code, confirm these are true:

- [ ] All entries in Section 4 (Bottlenecks) have been reviewed and accepted/overridden
- [ ] Paystack test account is set up and API keys are available
- [ ] Groq API key is generated and tested
- [ ] Cloudinary account is created with upload preset configured
- [ ] SendGrid account is verified with sender authentication
- [ ] PostgreSQL is accessible (local Docker or Render)
- [ ] Domain name is secured (or test domain decided)
- [ ] Git repository is initialized with `.gitignore` and `.env.example`
- [ ] At least 10 vehicle catalog entries are prepared for seeding

---

*This document is the contract between you and the machine. Anything not specified here is a guess — and guesses ship bugs.*
