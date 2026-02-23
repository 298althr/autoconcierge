# DEALER360 — SYSTEM ARCHITECTURE & CORE WORKFLOWS
**Single Source of Truth for Platform Behavior**

> This document answers: "What does every user do, what does the system do in response, and how is it all wired together?"

---

## CORE USER WORKFLOWS

These are not pages. These are **behavioral sequences** — what a human does, what the machine does back, and what changes in the database as a result.

---

### WORKFLOW 1: Vehicle Discovery → Purchase Decision

**Who:** Any visitor (guest or authenticated)
**Where they start:** Landing page or direct link to a vehicle

**What they do:**
1. Open the platform → see featured vehicles and the AI Valuation tool
2. Search/filter by make, model, year, price range, condition
3. Click a vehicle → see full detail page (specs, images, trust score, market comparison)
4. Use the AI Valuation tool → input any car's make/model/year → get instant market intelligence
5. If interested → click "Join Auction" or "Contact Concierge"

**What they see:**
- Vehicle cards: image, make/model/year, price, trust score badge (0-100)
- Detail page: gallery, specs pulled from `vehicle_catalog`, current market value vs. listing price, depreciation curve, "Buy/Hold/Sell" AI signal
- AI Valuation: price breakdown across Tokunbo/Nigerian-used/brand-new, investment score (1-10), seasonal recommendation

**What changes in the system:**
- `user_interaction_embeddings` row created (search query, viewed vehicle) — feeds recommendation engine
- If guest → session tracked for lead capture. If valuation used → email/phone captured before showing full report
- No write to `vehicles`, `auctions`, or `bids` until authenticated action

**What can fail:**
- AI valuation provider timeout → show cached result or "temporarily unavailable" with retry
- Vehicle no longer available → show "Sold" status, suggest similar via semantic search
- Search returns zero results → show AI-recommended alternatives from embeddings

---

### WORKFLOW 2: Auction Participation → Winning a Vehicle

**Who:** Authenticated user with funded wallet
**Where they start:** Vehicle detail page showing "Live Auction" or "Upcoming Auction" badge

**What they do:**
1. Click "Join Auction" → system checks: `is_authenticated? → has_kyc? → has_sufficient_funds?`
2. If any check fails → shown the specific blocker (login, complete KYC, fund wallet)
3. Enter auction room → see live bid feed, current price, time remaining, bidder count
4. Place bid → enter amount (must exceed current bid + minimum increment)
5. Watch real-time updates → see if outbid → place new bid or wait
6. Auction ends → winner notification or "outbid" result

**What they see:**
- Pre-entry: wallet balance, maximum bidding power calculation, deposit requirement (20% of bid)
- In-room: live price ticker (WebSocket), countdown timer, bid history feed, "You are winning" / "You are outbid" status
- Post-auction: "Congratulations" modal with next steps OR "This auction has ended" with similar vehicles

**What changes in the system:**
```
ON BID PLACED:
  1. Validate: user.buying_power >= (sum_of_active_winning_bids + new_bid) * 0.20
  2. Insert into `bids` (auction_id, user_id, amount, timestamp, is_platform_bid=false)
  3. Update `auctions.current_price` = new_bid_amount
  4. Broadcast via WebSocket to all connected clients in room `auction:{id}`
  5. If bid placed in last 2 minutes → extend auction by 2 minutes (anti-sniping)

ON AUCTION END:
  1. Select highest bid → set `auctions.winner_id`
  2. Lock 20% deposit from winner's wallet → insert `transactions` (type='deposit_hold')
  3. Update `auctions.status` = 'pending_settlement'
  4. Notify winner (email + SMS + in-app) with payment deadline
  5. Notify losers with "similar vehicles" recommendations

AI RESERVE PROTECTION (runs every 30 seconds during auction):
  1. If current_price < reserve_price * 0.90 AND time_remaining < 60 minutes
  2. AI places platform bid at current_price + minimum_increment
  3. Insert into `bids` with is_platform_bid=true
  4. Hard stop: never bid above reserve_price * 0.95
```

**What can fail:**
- Concurrent bids (race condition) → serialize with PostgreSQL `SELECT FOR UPDATE` row lock on auction row
- WebSocket disconnect → client auto-reconnects, fetches latest state via REST fallback
- Payment failure on deposit hold → winner has 24h to fund wallet, else auction goes to next highest bidder
- User bids beyond capacity → rejected at validation step with clear error message

---

### WORKFLOW 3: Post-Auction Settlement → Taking Ownership

**Who:** Auction winner
**Where they start:** "You Won" notification → links to settlement page

**What they do:**
1. View settlement summary: vehicle details, winning bid, deposit already held, remaining balance due
2. Complete payment for remaining 80% → Paystack checkout
3. Choose delivery method: pickup from facility OR delivery to address (₦50,000)
4. Upload required documents: ID, proof of address (for registration)
5. Track progress through settlement stages

**What they see:**
- Settlement dashboard with stages: Payment → Inspection → Documentation → Delivery
- Each stage has status: pending / in-progress / completed
- Estimated completion dates per stage
- Direct chat with assigned concierge

**What changes in the system:**
```
ON FULL PAYMENT:
  1. Convert deposit hold to confirmed payment → update `transactions`
  2. Create `service_requests` (type='post_auction_settlement', vehicle_id, user_id)
  3. Update `vehicles.status` = 'in_settlement'
  4. Update `vehicles.owner_id` = winner's user_id
  5. Assign concierge → create `concierge_tasks` (priority='high')

ON COMPLETION:
  1. Update `service_requests.status` = 'completed'
  2. Update `vehicles.status` = 'owned'
  3. Add entry to `vehicle_history` JSONB log (immutable append)
  4. Vehicle appears in user's Digital Garage
```

**What can fail:**
- Payment timeout → 24h deadline, then escalate to next bidder. Deposit forfeited (platform revenue)
- Document rejection → concierge contacts user, re-upload flow
- Delivery delay → tracking page shows real status, concierge proactively updates

---

### WORKFLOW 4: Digital Garage → Managing Owned Vehicles

**Who:** Authenticated vehicle owner
**Where they start:** Dashboard → "My Garage" section

**What they do:**
1. View all owned vehicles as cards with current market valuations
2. Click a vehicle → see full ownership dashboard (history, valuation trends, service records)
3. Take action: Schedule Service / Request Upgrade / List for Sale / View Insurance Options

**What they see:**
- Portfolio summary: total portfolio value, monthly change %, top performer
- Per vehicle: current market value (AI-updated weekly), purchase price, ROI %, service history timeline, next recommended service
- Action buttons contextual to vehicle status

**What changes in the system:**
```
ON GARAGE VIEW:
  1. Fetch all vehicles WHERE owner_id = user AND status IN ('owned', 'in_service')
  2. For each vehicle, fetch latest valuation from `vehicle_valuations`
  3. Fetch service history from `vehicle_history` JSONB

ON LIST FOR SALE:
  1. User sets asking price (AI suggests based on market data)
  2. Choose: Direct Sale or Auction
  3. Create `auctions` record (if auction) or `listings` record (if direct)
  4. Update `vehicles.status` = 'listed'
  5. Trigger AI imagery pipeline → generate fresh photos if older than 30 days

ON SCHEDULE SERVICE:
  1. Select service type (Maintenance, Repair, Upgrade)
  2. Create `service_requests` (type, vehicle_id, user_id, description)
  3. System matches to available partners based on type + location + rating
  4. User selects partner → quote generated → approval → execution
```

**What can fail:**
- Valuation data stale → show "as of [date]" label, queue re-valuation
- No partners available for requested service → show waitlist option, notify when available
- Vehicle in active service → block "List for Sale" until service complete

---

### WORKFLOW 5: Service Request → Execution → Completion

**Who:** Vehicle owner OR concierge on behalf of owner
**Where they start:** Vehicle detail in Garage → "Request Service" button

**What they do:**
1. Select service category: Logistics / Registration / Maintenance / Body Upgrade / Performance
2. Describe need (free text + structured fields depending on category)
3. Receive partner matches with quotes
4. Approve quote → make payment
5. Track service execution through stages
6. Receive completion notification → confirm satisfaction

**What they see:**
- Service request form (category-specific fields)
- Partner options: name, rating, estimated time, price, specialties
- Progress tracker: 6-stage state machine (Request → Quote → Payment → Execution → QC → Handover)
- Completion: before/after photos, invoice, satisfaction survey

**What changes in the system:**
```
STATE MACHINE (service_requests.workflow_state):

  'requested'   → Admin/system assigns partner → 'quoted'
  'quoted'      → User approves + pays       → 'paid'
  'paid'        → Partner begins work         → 'in_progress'
  'in_progress' → Partner submits completion  → 'qc_pending'
  'qc_pending'  → Admin verifies quality      → 'completed' (or 'qc_failed' → back to 'in_progress')
  'completed'   → User confirms handover      → 'closed'

CONSTRAINTS:
  - Cannot skip states. Cannot go from 'requested' to 'in_progress'.
  - 'completed' requires admin `qc_passed = true` flag
  - Every state change appends to `vehicle_history` JSONB log
  - Every state change triggers notification to user
  - Partner payment released only after 'closed' status
```

**What can fail:**
- Partner no-show → escalation timer (24h). Reassign to backup partner
- QC failure → partner must redo. If repeated failure → partner tier downgrade
- Payment dispute → escrow holds funds, concierge mediates
- Service takes longer than estimated → automatic notification to user at 80% of estimated time

---

### WORKFLOW 6: Dealer Onboarding → Inventory Management

**Who:** Professional car dealer applying for dealer account
**Where they start:** "Become a Dealer" application page

**What they do:**
1. Submit application: business name, CAC registration, business address, phone, ID
2. Upload KYC documents: CAC certificate, valid ID, proof of address
3. Wait for verification (admin reviews within 48h)
4. Once approved → access dealer dashboard
5. List vehicles: bulk upload or individual entry
6. Manage auctions: create, monitor, settle
7. View analytics: sales performance, market trends, inventory health

**What they see:**
- Application status tracker (submitted → under_review → approved/rejected)
- Dealer dashboard: active listings, auction performance, revenue summary
- Inventory management: add/edit/remove vehicles, set pricing, upload images
- Market intelligence: demand trends, pricing recommendations, seasonal signals

**What changes in the system:**
```
ON APPLICATION:
  1. Insert `users` (role='dealer_pending')
  2. Insert `kyc_applications` (documents, status='pending')
  3. Notify admin of new dealer application

ON APPROVAL:
  1. Update `users.role` = 'dealer'
  2. Update `kyc_applications.status` = 'approved'
  3. Create `partner_profiles` record (tier='bronze', commission_rate=default)
  4. Provision API access if enterprise tier

ON VEHICLE LISTING:
  1. Validate: dealer.kyc_status = 'approved'
  2. Insert `vehicles` (catalog_id, vin, price, condition, images)
  3. Generate embedding → insert `vehicle_embeddings`
  4. If auction → create `auctions` record
```

**What can fail:**
- KYC documents illegible → rejection with specific feedback, re-upload flow
- Duplicate VIN → reject listing, show existing vehicle record
- Dealer account suspended → block all operations, show reason and appeal process

---

### WORKFLOW 7: Admin Operations → Revenue Management

**Who:** Platform admin/manager
**Where they start:** Admin panel login → Manager Dashboard

**What they do:**
1. View revenue dashboard: daily/weekly/monthly GMV, take rate, active auctions, pending settlements
2. Manage auctions: approve dealer-created auctions, set featured, monitor AI bidding activity
3. Manage partners: view performance scores, adjust tiers, update commission rates
4. Handle disputes: review flagged transactions, make manual adjustments
5. Configure pricing: update global commission rates, service fees, featured listing costs
6. Monitor AI: review model performance, cost tracking, cache hit rates

**What they see:**
- Real-time revenue metrics with charts (Chart.js)
- Auction monitor: live auctions with bid activity, AI intervention status
- Partner scorecards: quality/speed/satisfaction/volume breakdown
- Transaction log: filterable by type, date, status, amount
- Alert feed: flagged transactions, unusual activity, failed payments

**What changes in the system:**
```
ADMIN ACTIONS AND THEIR EFFECTS:

Commission Rate Update:
  → Update `commission_rates` table
  → Affects ALL future transactions immediately
  → Logged in `admin_audit_log`

Partner Tier Change:
  → Update `partner_profiles.tier`
  → Recalculate commission rate based on tier
  → Notify partner of tier change

Manual Transaction Override:
  → Insert `transactions` (type='manual_adjustment', approved_by=admin_id)
  → Update affected user's `wallet_balance`
  → Full audit trail in `admin_audit_log`

Auction Management:
  → Approve/reject dealer auctions (updates `auctions.status`)
  → Can force-end auction (emergency)
  → Can void auction results (with reason logged)
```

---

### WORKFLOW 8: Concierge Task Handling

**Who:** Concierge operator (human-in-the-loop)
**Where they start:** Concierge panel → Task queue

**What they do:**
1. View incoming user messages sorted by priority (High = active transaction, Low = browsing)
2. Right-click message → "Convert to Task" → structured task created
3. Assign task to appropriate partner or internal team
4. Track task through completion
5. Close task → trigger user notification

**What they see:**
- Message queue with priority color coding
- Task board (kanban): New → Assigned → In Progress → Completed
- Quick-action buttons: Create Service Request, Schedule Callback, Escalate to Manager
- User context panel: user's vehicles, transaction history, sentiment score

**What changes in the system:**
```
ON TASK CREATION:
  1. Insert `concierge_tasks` (user_id, source_message, priority, type)
  2. If type matches service → auto-create `service_requests`
  3. Notify assigned operator

ON TASK COMPLETION:
  1. Update `concierge_tasks.status` = 'completed'
  2. Notify user with result/next steps
  3. Log resolution time for KPI tracking
```

---

## 1️⃣ IDENTITY SYSTEM

### Authentication
- **Method:** Email + password (bcrypt hash) + optional phone OTP (Twilio/Termii)
- **Token:** JWT with 24h expiry, refresh token with 7-day expiry
- **Storage:** Access token in memory (not localStorage), refresh token in httpOnly cookie

### Roles (Hierarchical)

| Role | Can Do | Cannot Do |
|:---|:---|:---|
| `guest` | Browse catalog, use AI valuation, search | Bid, access garage, request services |
| `user` | Everything guest can + bid, own vehicles, request services, use garage | List vehicles for sale (needs dealer or verified seller status) |
| `verified_seller` | Everything user can + list personal vehicles for sale | Bulk listing, API access |
| `dealer` | Everything verified_seller can + bulk listing, inventory management, analytics | Admin functions |
| `concierge` | View user messages, create tasks, assign partners | Price configuration, financial overrides |
| `manager` | Everything concierge can + configure pricing, manage partners, view revenue | User data deletion, system configuration |
| `admin` | Everything. Full system access | — |

### Guest Access (Lead Magnet Strategy)
- **Allowed without login:** Vehicle catalog browsing, search, AI valuation (first result free, full report requires email), vehicle detail pages
- **Requires authentication:** Placing bids, accessing digital garage, requesting services, viewing transaction history
- **Requires KYC:** Participating in auctions (bidding), selling vehicles, withdrawing funds

### Session Management
- Active sessions stored in Redis with TTL
- One active session per device (new login invalidates old session on same device type)
- Force-logout capability from admin panel

---

## 2️⃣ CORE BUSINESS LOGIC

### Central Entity: **Vehicle**
The vehicle is the nucleus. Every other entity revolves around it.

```
Vehicle Lifecycle States:
  'catalog_only'    → exists in catalog but not physical inventory
  'available'       → physical vehicle ready for sale/auction
  'in_auction'      → currently in an active auction
  'pending_settlement' → auction won, awaiting payment
  'in_settlement'   → payment received, processing transfer
  'owned'           → in a user's garage
  'in_service'      → undergoing maintenance/upgrade
  'listed'          → owner listed for resale
  'sold'            → transaction complete, awaiting new owner confirmation
  'archived'        → removed from active inventory
```

### CRUD Operations by Entity

**Vehicles:**
- **Create:** Admin/Dealer adds to inventory (links to catalog entry)
- **Read:** Anyone can browse. Owner sees full history in garage
- **Update:** Admin updates status. Owner can update listing price. Service updates condition
- **Delete:** Soft delete only (status → 'archived'). Never hard delete — audit trail required

**Auctions:**
- **Create:** Admin/Dealer creates auction for a vehicle
- **Read:** Anyone can view active/upcoming. Only participants see bid details
- **Update:** System updates current_price on each bid. Admin can extend/cancel
- **Delete:** Never. Cancelled auctions are status='cancelled' with reason

**Service Requests:**
- **Create:** User or concierge creates request
- **Read:** Owner, assigned partner, and admin can view
- **Update:** State machine transitions only (no arbitrary state jumps)
- **Delete:** Never. Abandoned requests are status='cancelled'

### Key State Machines

**Auction States:**
```
'draft' → 'scheduled' → 'live' → 'ended' → 'pending_settlement' → 'settled'
                                    ↘ 'unsold' → 'relisted' (AI re-images vehicle)
                          'cancelled' (admin action, at any pre-'ended' state)
```

**Service Request States:**
```
'requested' → 'quoted' → 'paid' → 'in_progress' → 'qc_pending' → 'completed' → 'closed'
                                                        ↘ 'qc_failed' → 'in_progress'
```

---

## 3️⃣ DATA LAYER

### Database Strategy
- **PostgreSQL** (primary): All relational data, business logic, Pgvector embeddings
- **Redis**: Sessions, cache, real-time auction state
- **File Storage**: Cloudinary for images/documents

> MongoDB was in early docs but is **not recommended for MVP**. PostgreSQL handles logs and audit trails via JSONB columns. One database = simpler ops, ACID guarantees, lower cost.

### Complete Schema

```sql
-- ==========================================
-- USERS & IDENTITY
-- ==========================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  role            VARCHAR(20) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user','verified_seller','dealer','concierge','manager','admin')),
  display_name    VARCHAR(100),
  avatar_url      TEXT,
  wallet_balance  DECIMAL(15,2) DEFAULT 0.00,
  kyc_status      VARCHAR(20) DEFAULT 'none'
                  CHECK (kyc_status IN ('none','pending','approved','rejected')),
  kyc_data        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- VEHICLE CATALOG (Reference Data — "The Brain")
-- ==========================================

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
  price_foreign_used  DECIMAL(15,2),      -- Tokunbo market avg
  price_nigerian_used DECIMAL(15,2),      -- Local used market avg
  price_brand_new     DECIMAL(15,2),
  clearing_cost_est   DECIMAL(15,2),      -- Estimated customs duty
  resell_rank         INT CHECK (resell_rank BETWEEN 1 AND 10),
  popularity_index    INT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_catalog_make_model ON vehicle_catalog(make, model);
CREATE INDEX idx_catalog_year ON vehicle_catalog(year_start, year_end);

-- ==========================================
-- VEHICLES (Physical Inventory)
-- ==========================================

CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id      UUID REFERENCES vehicle_catalog(id),
  owner_id        UUID REFERENCES users(id),
  listed_by       UUID REFERENCES users(id),         -- dealer or admin who listed
  vin             VARCHAR(17) UNIQUE,
  year            INT NOT NULL,
  condition       VARCHAR(20) DEFAULT 'clean'
                  CHECK (condition IN ('salvage','rough','clean','excellent','upgraded')),
  mileage_km      INT,
  color           VARCHAR(30),
  price           DECIMAL(15,2),
  status          VARCHAR(25) DEFAULT 'available'
                  CHECK (status IN (
                    'available','in_auction','pending_settlement','in_settlement',
                    'owned','in_service','listed','sold','archived'
                  )),
  images          JSONB DEFAULT '[]',                 -- array of Cloudinary URLs
  features        JSONB DEFAULT '[]',                 -- array of feature strings
  damage_report   JSONB DEFAULT '{}',
  trust_score     INT CHECK (trust_score BETWEEN 0 AND 100),
  history_log     JSONB DEFAULT '[]',                 -- immutable append-only log
  location        VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);

-- ==========================================
-- AUCTIONS
-- ==========================================

CREATE TABLE auctions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) NOT NULL,
  created_by      UUID REFERENCES users(id) NOT NULL,
  winner_id       UUID REFERENCES users(id),
  auction_type    VARCHAR(20) DEFAULT 'timed'
                  CHECK (auction_type IN ('timed','reserve','no_reserve','flash')),
  status          VARCHAR(25) DEFAULT 'draft'
                  CHECK (status IN (
                    'draft','scheduled','live','ended','pending_settlement',
                    'settled','unsold','cancelled','relisted'
                  )),
  start_price     DECIMAL(15,2) NOT NULL,
  reserve_price   DECIMAL(15,2),
  current_price   DECIMAL(15,2),
  bid_increment   DECIMAL(15,2) DEFAULT 50000,       -- Min ₦50K increment
  deposit_pct     DECIMAL(5,2) DEFAULT 20.00,        -- 20% deposit required
  start_time      TIMESTAMP NOT NULL,
  end_time        TIMESTAMP NOT NULL,
  original_end    TIMESTAMP,                          -- for tracking auto-extensions
  bid_count       INT DEFAULT 0,
  bidder_count    INT DEFAULT 0,
  ai_bids_placed  INT DEFAULT 0,
  featured        BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_vehicle ON auctions(vehicle_id);
CREATE INDEX idx_auctions_end ON auctions(end_time);

-- ==========================================
-- BIDS
-- ==========================================

CREATE TABLE bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID REFERENCES auctions(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  is_platform_bid BOOLEAN DEFAULT false,             -- AI reserve protection bid
  is_winning      BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_bids_amount ON bids(auction_id, amount DESC);

-- ==========================================
-- SERVICE REQUESTS
-- ==========================================

CREATE TABLE service_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  partner_id      UUID REFERENCES partners(id),
  service_type    VARCHAR(30) NOT NULL
                  CHECK (service_type IN (
                    'logistics','registration','maintenance',
                    'body_upgrade','performance','inspection','insurance'
                  )),
  workflow_state  VARCHAR(20) DEFAULT 'requested'
                  CHECK (workflow_state IN (
                    'requested','quoted','paid','in_progress',
                    'qc_pending','qc_failed','completed','closed','cancelled'
                  )),
  description     TEXT,
  quote_amount    DECIMAL(15,2),
  invoice_total   DECIMAL(15,2),
  commission_rate DECIMAL(5,4),
  platform_fee    DECIMAL(15,2),
  qc_passed       BOOLEAN,
  qc_notes        TEXT,
  state_log       JSONB DEFAULT '[]',                 -- log of state transitions with timestamps
  estimated_days  INT,
  due_date        DATE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_vehicle ON service_requests(vehicle_id);
CREATE INDEX idx_service_state ON service_requests(workflow_state);

-- ==========================================
-- PARTNERS (Service Providers)
-- ==========================================

CREATE TABLE partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),        -- partner's login account
  business_name     VARCHAR(200) NOT NULL,
  specialties       JSONB DEFAULT '[]',
  service_area      VARCHAR(100),
  tier              VARCHAR(20) DEFAULT 'bronze'
                    CHECK (tier IN ('bronze','silver','gold','platinum')),
  commission_rate   DECIMAL(5,4) DEFAULT 0.1500,
  performance_score INT DEFAULT 50,
  total_jobs        INT DEFAULT 0,
  avg_rating        DECIMAL(3,2) DEFAULT 0.00,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- TRANSACTIONS (Financial Ledger)
-- ==========================================

CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) NOT NULL,
  type            VARCHAR(30) NOT NULL
                  CHECK (type IN (
                    'deposit','withdrawal','bid_deposit_hold','bid_deposit_release',
                    'auction_payment','service_payment','commission_earned',
                    'refund','manual_adjustment','partner_payout'
                  )),
  amount          DECIMAL(15,2) NOT NULL,
  balance_after   DECIMAL(15,2),
  reference_id    UUID,                                -- links to auction, service_request, etc.
  reference_type  VARCHAR(30),                         -- 'auction', 'service_request', etc.
  paystack_ref    VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','failed','reversed')),
  description     TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ==========================================
-- CONCIERGE TASKS
-- ==========================================

CREATE TABLE concierge_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) NOT NULL,
  assigned_to     UUID REFERENCES users(id),
  source_message  TEXT,
  task_type       VARCHAR(30)
                  CHECK (task_type IN (
                    'service_inquiry','purchase_support','complaint',
                    'upgrade_request','general','escalation'
                  )),
  priority        VARCHAR(10) DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','urgent')),
  status          VARCHAR(20) DEFAULT 'new'
                  CHECK (status IN ('new','assigned','in_progress','completed','cancelled')),
  resolution      TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  resolved_at     TIMESTAMP
);

-- ==========================================
-- COMMISSION RATES (Admin-Configurable)
-- ==========================================

CREATE TABLE commission_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type    VARCHAR(30) UNIQUE NOT NULL,
  base_rate       DECIMAL(5,4) NOT NULL,
  min_rate        DECIMAL(5,4),
  max_rate        DECIMAL(5,4),
  rules           JSONB DEFAULT '[]',
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- ADMIN AUDIT LOG (Immutable)
-- ==========================================

CREATE TABLE admin_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID REFERENCES users(id) NOT NULL,
  action          VARCHAR(50) NOT NULL,
  target_type     VARCHAR(30),
  target_id       UUID,
  old_value       JSONB,
  new_value       JSONB,
  reason          TEXT,
  ip_address      INET,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_action ON admin_audit_log(action);

-- ==========================================
-- VECTOR EMBEDDINGS (Pgvector)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vehicle_embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  embedding       vector(1536),
  embedded_text   TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON vehicle_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE user_interaction_embeddings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id),
  embedding         vector(1536),
  interaction_type  VARCHAR(30),
  interaction_data  JSONB,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON user_interaction_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Relationships Diagram

```
users ──────────┬── owns ─────────── vehicles
                ├── bids_on ──────── bids → auctions → vehicles
                ├── requests ─────── service_requests → vehicles
                ├── has_tasks ────── concierge_tasks
                └── transacts ────── transactions

vehicle_catalog ── referenced_by ── vehicles

partners ───────── assigned_to ──── service_requests

admin_audit_log ── tracks ────────── users (admin actions)
```

---

## 4️⃣ ERROR HANDLING

### Critical Failure Points

| Failure | Detection | Response | Recovery |
|:---|:---|:---|:---|
| **Concurrent bids (race condition)** | PostgreSQL row lock contention | Serialize with `SELECT FOR UPDATE` on auction row | Losing transaction retries once, fails gracefully |
| **Paystack webhook missed** | Transaction stuck in 'pending' > 15min | Cron job polls Paystack API for status | Reconcile and update transaction |
| **AI provider down** | HTTP timeout / 5xx response | Failover: Groq → OpenRouter → Anthropic | Return cached result or "temporarily unavailable" |
| **WebSocket disconnect** | Client heartbeat timeout | Auto-reconnect with exponential backoff | REST fallback to get latest auction state |
| **Database connection lost** | Connection pool health check | Queue writes in Redis, retry on reconnect | pgbouncer connection pooling |
| **File upload failure** | Cloudinary error response | Retry 3x with backoff, then show error | User can retry upload |
| **Duplicate VIN submission** | UNIQUE constraint violation | Return validation error with existing vehicle link | No recovery needed — working as designed |

### Validation Rules (What MUST Be Validated)

```
USER INPUT:
  - Email: valid format, unique in DB
  - Phone: valid Nigerian format (+234...)
  - Password: min 8 chars, 1 uppercase, 1 number
  - VIN: exactly 17 alphanumeric characters
  - Bid amount: > current_price + bid_increment, <= user's buying_power

BUSINESS RULES:
  - Cannot bid on own auction
  - Cannot bid if wallet_balance < required deposit
  - Cannot place bid after auction end_time
  - Cannot transition service request to 'completed' without qc_passed = true
  - Cannot withdraw funds while active bids exist (committed capital)
  - Wallet balance can never go negative

DATA INTEGRITY:
  - Vehicle cannot be in two active auctions simultaneously
  - User cannot have role changed to 'dealer' without kyc_status = 'approved'
  - Transactions must always update wallet_balance atomically (use DB transactions)
```

---

## 5️⃣ SECURITY

### Permission Matrix (Route-Level)

| Route Pattern | guest | user | dealer | concierge | manager | admin |
|:---|:---|:---|:---|:---|:---|:---|
| `GET /api/vehicles` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/vehicles/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/valuation` | ✅* | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/bids` | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `GET /api/garage` | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `POST /api/vehicles` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `POST /api/auctions` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `GET /api/concierge/tasks` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `PATCH /api/admin/*` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `DELETE /api/admin/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Guest valuation requires email capture

### Sensitive Data Handling

| Data | Storage | Access | Protection |
|:---|:---|:---|:---|
| Passwords | `password_hash` (bcrypt, 12 rounds) | Never returned in API responses | — |
| KYC documents | Cloudinary (private URLs) | Owner + admin only | Signed URLs with 1h expiry |
| Wallet balance | PostgreSQL | Owner + admin only | Atomic DB transactions |
| Payment tokens | Never stored | Paystack handles | PCI compliance via Paystack |
| JWT secrets | Environment variable | Server-side only | Rotated quarterly |
| API keys | Environment variable | Server-side only | Different keys per environment |

### API Security Layers

```
Request → Rate Limiter (100/min per IP, 1000/min per authenticated user)
       → CORS (whitelist known origins only)
       → JWT Verification (check expiry, signature, blacklist)
       → Role Authorization (middleware checks route permissions)
       → Input Sanitization (parameterized queries, no string concat SQL)
       → Business Rule Validation (service layer checks)
       → Response (strip sensitive fields before sending)
```

---

## 6️⃣ DEPLOYMENT PLAN

### Infrastructure

| Component | Service | Cost Estimate |
|:---|:---|:---|
| **Web Application** | Render.com (Web Service) | $7-25/mo |
| **PostgreSQL** | Render Managed PostgreSQL | $7-50/mo |
| **Redis** | Render Managed Redis | $10/mo |
| **File Storage** | Cloudinary (Free → Pro) | $0-89/mo |
| **Domain** | Namecheap / Google Domains | $12/yr |
| **SSL** | Render (included) | Free |
| **Monitoring** | Sentry (free tier) | $0 |
| **Email** | SendGrid (free tier) | $0 |
| **SMS/OTP** | Termii | Pay-per-use |
| **Payments** | Paystack | 1.5% per transaction |
| **AI APIs** | Groq + OpenRouter | ~$30-40/mo |

**Total MVP infrastructure: ~$50-150/month**

### Docker Configuration

```yaml
# docker-compose.yml (production)
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - CLOUDINARY_URL=${CLOUDINARY_URL}
      - TERMII_API_KEY=${TERMII_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: pgvector/pgvector:pg16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=dealer360
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dealer360

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>

# Payments
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxx

# AI
GROQ_API_KEY=gsk_xxx
OPENROUTER_API_KEY=sk-or-xxx
OPENAI_API_KEY=sk-xxx              # for embeddings only

# File Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Notifications
TERMII_API_KEY=xxx
SENDGRID_API_KEY=xxx

# Application
APP_URL=https://dealer360.ng
CORS_ORIGINS=https://dealer360.ng,https://admin.dealer360.ng
NODE_ENV=production
PORT=3000
```

---

## 7️⃣ UX COMPLETION

### Mobile-First Strategy
- All layouts designed mobile-first (320px → 768px → 1024px → 1440px)
- Touch targets minimum 44x44px
- Bottom navigation on mobile (most-used actions within thumb reach)
- Swipe gestures for vehicle gallery

### PWA Requirements
- `manifest.json` with app name, icons, theme color
- Service worker for offline catalog browsing (cached vehicle data)
- Add-to-homescreen prompt after 2nd visit
- Push notifications via service worker (auction alerts, bid updates)

### Offline Support
- **Full offline:** Vehicle catalog (cached on first load)
- **Partial offline:** Garage view (syncs when online)
- **Online only:** Bidding, payments, real-time auction room

### Loading States (Every Async Operation)

| Action | Loading State | Error State | Empty State |
|:---|:---|:---|:---|
| Vehicle search | Skeleton cards (3-6 placeholders) | "Search failed. Try again." + retry button | "No vehicles match. Try adjusting filters." |
| Auction room entry | Full-screen spinner with "Connecting to live feed..." | "Connection failed. Retrying..." + manual retry | Never empty (auction always has data) |
| Placing bid | Button shows spinner + "Placing bid..." | Toast: "Bid failed: [reason]" | — |
| Wallet loading | Skeleton balance bar | "Unable to load balance" + retry | "₦0.00 — Fund your wallet" |
| Service request | Step-by-step progress animation | Toast with error + retry option | — |
| AI Valuation | Typing animation: "AI is analyzing..." | "Analysis unavailable. Try later." | — |

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for desktop
- Color contrast ratio ≥ 4.5:1
- Screen reader compatible headings and landmarks
