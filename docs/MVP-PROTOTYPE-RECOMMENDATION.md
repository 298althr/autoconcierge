# DEALER360 — MVP PROTOTYPE RECOMMENDATION
**First Deployable Product for Investor Audit & User Testing**

> **The problem:** 90+ documents, 16+ feature briefs, 6 revenue nodes, a 14-step workflow, an AI bidding engine, a 3D garage, a concierge system, and a multi-LLM orchestrator. All designed. None shipped.
>
> This document cuts through the feature overload and defines the **smallest product that proves the business model**.

---

## THE RAZOR: What Must the MVP Prove?

An investor asks three questions:

1. **"Does anyone want this?"** → Users must be able to discover and transact on vehicles
2. **"Does money flow?"** → A real payment must happen (Paystack)
3. **"What's defensible?"** → The AI trust/valuation layer must be visible

Everything else is future scope.

---

## MVP SCOPE: WHAT'S IN vs WHAT'S OUT

### ✅ IN (Ship This)

| Feature | Why It's Essential | Effort |
|:---|:---|:---|
| **User Auth** (email + password + JWT) | Cannot transact without identity | 2 days |
| **Vehicle Catalog** (seeded, read-only for users) | Core content. Nothing works without cars | 2 days |
| **Vehicle Detail Page** (specs, images, trust score, AI valuation) | The product's core experience | 3 days |
| **AI Valuation Tool** (free, public, email-gated full report) | Lead magnet. Proves AI value. Captures leads | 3 days |
| **Live Auction** (single format: timed, with reserve) | Core revenue mechanism. Must work end-to-end | 5 days |
| **Basic Wallet** (Paystack deposit, balance display) | Money must flow for investor demo | 3 days |
| **Digital Garage** (view owned vehicles after winning auction) | Closes the loop — buy → own | 2 days |
| **Admin Dashboard** (revenue overview, auction management, vehicle CRUD) | Operational control for demo | 4 days |
| **Basic Notifications** (email on bid, win, outbid) | Users must know things happened | 2 days |

**Total estimated effort: ~26 working days (5-6 weeks with one backend + one frontend engineer)**

### ❌ OUT (Build After Traction)

| Feature | Why It's Deferred | When to Build |
|:---|:---|:---|
| 3D Spatial Garage / 360° scenes | Impressive but not business-critical | After seed funding |
| Service Hub (maintenance, upgrades) | Requires partner network first | Month 3-4 |
| Concierge System | Needs operation team. Can use WhatsApp manually initially | Month 2-3 |
| Import Orchestration (US→NG pipeline) | Full 14-step workflow is too complex for MVP | Month 4-6 |
| AI Reserve Protection Bidding | Can run auctions without AI bids initially | Month 2 |
| Enterprise Data API (B2B) | No enterprise customers yet | Month 6+ |
| Multi-LLM Orchestrator | Single provider (Groq) is sufficient for MVP | Month 3 |
| OBD Telematics Integration | Hardware dependency, no user base yet | Month 6+ |
| Mobile App (React Native) | Web-first. Mobile PWA covers initial mobile users | Month 3-4 |
| Upgrade Marketplace | Requires partner ecosystem | Month 4-5 |
| Dealer Self-Service Portal | Manually manage dealers via admin panel initially | Month 3 |
| Vector Embeddings / Semantic Search | Standard search is fine for < 1,000 vehicles | Month 3 |

---

## MVP ARCHITECTURE

### Technology Choices (No Debate — Ship Fast)

| Layer | Choice | Rationale |
|:---|:---|:---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for SEO, fast hydration, file-based routing |
| **Styling** | Tailwind CSS | Rapid UI development, consistent design system |
| **Backend** | Express.js (Node.js) | Team already knows it. Simple. Fast |
| **Database** | PostgreSQL (single instance) | One database. No MongoDB. No Redis for MVP |
| **Payments** | Paystack | Nigerian market standard. Works out of the box |
| **AI** | Groq (single provider) | Free tier handles MVP traffic. Fast inference |
| **Real-time** | Socket.IO | Auction room live updates |
| **File Storage** | Cloudinary | Image upload, transformation, CDN |
| **Hosting** | Render.com | Simple. Cheap. Auto-deploy from GitHub |
| **Auth** | JWT (custom) | No third-party dependency. Full control |

### What We're NOT Using in MVP
- ❌ MongoDB (PostgreSQL JSONB handles logs)
- ❌ Redis (in-memory session store is fine at MVP scale)
- ❌ Multiple AI providers (Groq only)
- ❌ N8N workflows (direct function calls)
- ❌ Docker (Render handles deployment)
- ❌ Pgvector (no embeddings yet — standard SQL search)

---

## MVP DATA MODEL

### Clear Intent: Every table has one job

```sql
-- =============================================
-- TABLE 1: users
-- Intent: Authentication + wallet + role
-- =============================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  display_name    VARCHAR(100),
  role            VARCHAR(20) NOT NULL DEFAULT 'user',    -- 'user' | 'admin'
  wallet_balance  DECIMAL(15,2) DEFAULT 0.00,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- MVP has only 2 roles: 'user' and 'admin'
-- Dealer, concierge, manager roles are post-MVP


-- =============================================
-- TABLE 2: vehicle_catalog
-- Intent: Reference data (makes, models, specs)
-- Pre-seeded. Users never write to this table.
-- =============================================
CREATE TABLE vehicle_catalog (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make                VARCHAR(50) NOT NULL,           -- "Toyota"
  model               VARCHAR(100) NOT NULL,          -- "Camry"
  year_start          INT NOT NULL,                   -- 2018
  year_end            INT,                            -- 2022
  trim                VARCHAR(50),                    -- "XSE"
  body_type           VARCHAR(30),                    -- "sedan"
  specs               JSONB DEFAULT '{}',             -- { hp, torque, mpg, engine }
  price_foreign_used  DECIMAL(15,2),                  -- Tokunbo avg
  price_nigerian_used DECIMAL(15,2),                  -- Local used avg
  resell_rank         INT,                            -- 1-10
  created_at          TIMESTAMP DEFAULT NOW()
);


-- =============================================
-- TABLE 3: vehicles
-- Intent: Actual cars for sale / in auction
-- Admin creates these. Users buy them.
-- =============================================
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id      UUID REFERENCES vehicle_catalog(id),
  owner_id        UUID REFERENCES users(id),          -- null = platform inventory
  vin             VARCHAR(17) UNIQUE,
  year            INT NOT NULL,
  make            VARCHAR(50) NOT NULL,               -- denormalized for fast queries
  model           VARCHAR(100) NOT NULL,              -- denormalized for fast queries
  trim            VARCHAR(50),
  condition       VARCHAR(20) DEFAULT 'clean',        -- 'salvage' | 'clean' | 'excellent'
  mileage_km      INT,
  color           VARCHAR(30),
  price           DECIMAL(15,2),                      -- asking price or final sale price
  status          VARCHAR(20) DEFAULT 'available',    -- see state diagram below
  images          JSONB DEFAULT '[]',                 -- ["https://cloudinary.com/..."]
  features        TEXT[],                             -- {"leather seats", "sunroof"}
  trust_score     INT,                                -- 0-100, admin-assigned for MVP
  location        VARCHAR(100),
  history_log     JSONB DEFAULT '[]',                 -- append-only event log
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- MVP Vehicle States (simplified):
--   'available'         → can be auctioned
--   'in_auction'        → active auction in progress
--   'pending_payment'   → auction won, awaiting full payment
--   'sold'              → payment complete, in buyer's garage
--   'archived'          → removed from platform


-- =============================================
-- TABLE 4: auctions
-- Intent: One auction per vehicle. Time-limited.
-- =============================================
CREATE TABLE auctions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID REFERENCES vehicles(id) NOT NULL UNIQUE,  -- 1:1 for MVP
  created_by      UUID REFERENCES users(id) NOT NULL,
  winner_id       UUID REFERENCES users(id),
  status          VARCHAR(20) DEFAULT 'scheduled',    -- see state diagram below
  start_price     DECIMAL(15,2) NOT NULL,
  reserve_price   DECIMAL(15,2),                      -- null = no reserve
  current_price   DECIMAL(15,2),
  bid_increment   DECIMAL(15,2) DEFAULT 50000.00,     -- min ₦50K increment
  start_time      TIMESTAMP NOT NULL,
  end_time        TIMESTAMP NOT NULL,
  bid_count       INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- MVP Auction States:
--   'scheduled'    → future auction, visible but not biddable
--   'live'         → accepting bids right now
--   'ended'        → time's up, winner determined
--   'settled'      → winner paid, vehicle transferred
--   'unsold'       → ended below reserve or no bids
--   'cancelled'    → admin cancelled


-- =============================================
-- TABLE 5: bids
-- Intent: Every bid ever placed. Immutable.
-- =============================================
CREATE TABLE bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID REFERENCES auctions(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Constraints enforced in application layer:
--   amount > auction.current_price + auction.bid_increment
--   user.wallet_balance >= amount * 0.20 (20% deposit coverage)
--   user_id != auction.created_by (can't bid on own auction)


-- =============================================
-- TABLE 6: transactions
-- Intent: Financial ledger. Every money movement.
-- =============================================
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) NOT NULL,
  type            VARCHAR(30) NOT NULL,               -- see types below
  amount          DECIMAL(15,2) NOT NULL,
  balance_after   DECIMAL(15,2) NOT NULL,
  reference_id    UUID,                               -- links to auction_id or null
  paystack_ref    VARCHAR(100),                       -- Paystack transaction reference
  status          VARCHAR(20) DEFAULT 'completed',
  description     TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- MVP Transaction Types:
--   'deposit'          → user adds money via Paystack
--   'withdrawal'       → user withdraws to bank
--   'auction_payment'  → winner pays for vehicle
--   'refund'           → admin-initiated refund


-- =============================================
-- TABLE 7: valuations
-- Intent: AI-generated vehicle valuations (cached)
-- =============================================
CREATE TABLE valuations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make            VARCHAR(50) NOT NULL,
  model           VARCHAR(100) NOT NULL,
  year            INT NOT NULL,
  trim            VARCHAR(50),
  condition       VARCHAR(20),
  result          JSONB NOT NULL,                     -- full AI analysis result
  requested_by    UUID REFERENCES users(id),          -- null = anonymous
  requester_email VARCHAR(255),                       -- captured for lead gen
  created_at      TIMESTAMP DEFAULT NOW()
);

-- No expiry for MVP. Results cached indefinitely.
-- Future: add TTL and re-valuation triggers.
```

### Relationships (Visual)

```
users
  ├── owns ──────────→ vehicles (owner_id)
  ├── creates ───────→ auctions (created_by)
  ├── wins ──────────→ auctions (winner_id)
  ├── places ────────→ bids (user_id)
  ├── has ───────────→ transactions (user_id)
  └── requests ──────→ valuations (requested_by)

vehicle_catalog
  └── referenced_by → vehicles (catalog_id)

vehicles
  └── has_one ──────→ auctions (vehicle_id, UNIQUE)

auctions
  └── has_many ─────→ bids (auction_id)
```

### State Diagrams

**Vehicle:**
```
available → in_auction → pending_payment → sold
                ↓                ↓
              unsold         (timeout → relist)
```

**Auction:**
```
scheduled → live → ended → settled
               ↓       ↓
           cancelled  unsold
```

---

## MVP PAGES (Only These — Nothing More)

### Public (No Auth Required)

| Page | Route | Purpose |
|:---|:---|:---|
| **Landing** | `/` | Hero + featured vehicles + AI valuation CTA |
| **Browse Vehicles** | `/vehicles` | Search, filter, grid of vehicle cards |
| **Vehicle Detail** | `/vehicles/[id]` | Full specs, images, trust score, auction info |
| **AI Valuation** | `/valuation` | Input make/model/year → get AI report (email-gated) |
| **Login** | `/login` | Email + password |
| **Register** | `/register` | Email + password + phone |

### Authenticated (User)

| Page | Route | Purpose |
|:---|:---|:---|
| **Auction Room** | `/auctions/[id]` | Live bidding interface with Socket.IO |
| **My Garage** | `/garage` | Owned vehicles, valuations, portfolio |
| **My Wallet** | `/wallet` | Balance, deposit via Paystack, transaction history |
| **Profile** | `/profile` | Edit name, phone, change password |

### Admin (Admin Role Only)

| Page | Route | Purpose |
|:---|:---|:---|
| **Dashboard** | `/admin` | Revenue metrics, active auctions, user count |
| **Manage Vehicles** | `/admin/vehicles` | CRUD vehicles, upload images, set trust scores |
| **Manage Auctions** | `/admin/auctions` | Create/edit/cancel auctions, view bid activity |
| **Manage Users** | `/admin/users` | View users, adjust wallet balances, toggle active |
| **Transactions** | `/admin/transactions` | Full transaction ledger with filters |

**Total pages: 15** (not 50+)

---

## MVP API ENDPOINTS

```
AUTH
  POST   /api/auth/register      → create account
  POST   /api/auth/login          → get JWT
  POST   /api/auth/refresh        → refresh token
  GET    /api/auth/me             → current user

VEHICLES
  GET    /api/vehicles            → list (with search/filter query params)
  GET    /api/vehicles/:id        → detail
  POST   /api/vehicles            → create (admin only)
  PATCH  /api/vehicles/:id        → update (admin only)

AUCTIONS
  GET    /api/auctions            → list active/upcoming
  GET    /api/auctions/:id        → detail with bid history
  POST   /api/auctions            → create (admin only)
  PATCH  /api/auctions/:id        → update status (admin only)

BIDS
  POST   /api/bids                → place bid (authenticated, validated)
  GET    /api/bids/my             → user's bid history

WALLET
  GET    /api/wallet              → balance + recent transactions
  POST   /api/wallet/deposit      → initiate Paystack deposit
  POST   /api/wallet/webhook      → Paystack webhook handler

VALUATIONS
  POST   /api/valuations          → request AI valuation
  GET    /api/valuations/:id      → get result

ADMIN
  GET    /api/admin/dashboard     → revenue metrics
  GET    /api/admin/users         → user list
  PATCH  /api/admin/users/:id     → update user (role, active, wallet)
  GET    /api/admin/transactions  → full ledger

WEBSOCKET
  auction:{id}                    → join auction room
  auction:{id}:bid                → new bid broadcast
  auction:{id}:ended              → auction ended broadcast
```

**Total endpoints: ~20** (not 100+)

---

## MVP FOLDER STRUCTURE

```
dealer360/
├── client/                       # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing
│   │   │   ├── vehicles/
│   │   │   │   ├── page.tsx                # Browse
│   │   │   │   └── [id]/page.tsx           # Detail
│   │   │   ├── valuation/page.tsx          # AI Valuation
│   │   │   ├── auctions/[id]/page.tsx      # Auction Room
│   │   │   ├── garage/page.tsx             # My Garage
│   │   │   ├── wallet/page.tsx             # My Wallet
│   │   │   ├── profile/page.tsx            # Profile
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── admin/
│   │   │       ├── page.tsx                # Dashboard
│   │   │       ├── vehicles/page.tsx       # Manage Vehicles
│   │   │       ├── auctions/page.tsx       # Manage Auctions
│   │   │       ├── users/page.tsx          # Manage Users
│   │   │       └── transactions/page.tsx   # Ledger
│   │   ├── components/
│   │   │   ├── ui/                         # Buttons, inputs, cards, modals
│   │   │   ├── vehicle/                    # VehicleCard, VehicleGallery
│   │   │   ├── auction/                    # BidPanel, AuctionTimer, BidFeed
│   │   │   ├── wallet/                     # BalanceCard, DepositModal
│   │   │   └── layout/                     # Navbar, Sidebar, Footer
│   │   ├── lib/
│   │   │   ├── api.ts                      # Fetch wrapper with JWT
│   │   │   ├── socket.ts                   # Socket.IO client
│   │   │   └── auth.ts                     # Auth context + guards
│   │   └── styles/
│   │       └── globals.css
│   └── public/
│       └── images/
│
├── server/                       # Express backend
│   ├── index.js                  # Entry point
│   ├── config/
│   │   ├── database.js           # PostgreSQL connection pool
│   │   └── env.js                # Environment variable validation
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── roles.js              # Role-based access control
│   │   ├── validate.js           # Input validation (Joi or Zod)
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── auctions.js
│   │   ├── bids.js
│   │   ├── wallet.js
│   │   ├── valuations.js
│   │   └── admin.js
│   ├── services/
│   │   ├── auctionService.js     # Auction state machine logic
│   │   ├── bidService.js         # Bid validation + placement
│   │   ├── walletService.js      # Balance management (atomic)
│   │   ├── valuationService.js   # Groq AI valuation calls
│   │   ├── paystackService.js    # Payment processing
│   │   └── socketService.js      # Socket.IO event handlers
│   ├── db/
│   │   ├── migrations/           # SQL migration files
│   │   └── seeds/                # Vehicle catalog seed data
│   └── utils/
│       ├── logger.js
│       └── helpers.js
│
├── .env.example
├── package.json
├── README.md
└── render.yaml                   # Render deployment config
```

---

## DEPLOYMENT CHECKLIST (MVP)

### Before First Deploy

- [ ] PostgreSQL database provisioned on Render
- [ ] Run migration scripts to create all 7 tables
- [ ] Seed `vehicle_catalog` with 500+ entries (from existing JSON catalog data)
- [ ] Seed 20-30 `vehicles` with test data and Cloudinary images
- [ ] Paystack account activated (test mode first, live for demo)
- [ ] Groq API key provisioned
- [ ] Cloudinary account configured
- [ ] Environment variables set in Render dashboard
- [ ] Domain pointed to Render (dealer360.ng or staging subdomain)

### Demo Day Preparation

- [ ] Create 3 admin accounts
- [ ] Create 5 test user accounts with funded wallets
- [ ] Set up 3-5 live auctions with different end times
- [ ] Pre-generate AI valuations for 10 popular cars
- [ ] Test full flow: register → deposit → bid → win → see in garage
- [ ] Verify Paystack webhook receives and processes
- [ ] Verify Socket.IO works across multiple browser tabs

---

## SUCCESS CRITERIA (How We Know MVP Works)

| Test | Pass Condition |
|:---|:---|
| User can register and login | JWT issued, auth state persisted |
| User can browse and search vehicles | Results load < 2s, filters work |
| User can view AI valuation | Groq responds, report rendered |
| User can deposit via Paystack | Balance updates after webhook |
| User can join live auction and bid | Real-time update across tabs < 500ms |
| User wins auction and vehicle appears in garage | State transitions correctly |
| Admin can create vehicle and auction | Appears on public browse page |
| Admin can see revenue dashboard | Metrics match actual transactions |
| System rejects invalid bids | Over-capacity, under-increment, expired |
| System handles concurrent bids | No race conditions, correct winner |

---

## TIMELINE

```
WEEK 1: Foundation
  ├── Day 1-2: DB setup, migrations, seed data
  ├── Day 3-4: Auth system (register/login/JWT/middleware)
  └── Day 5:   Vehicle API (CRUD + search)

WEEK 2: Core Features
  ├── Day 1-2: Auction API + state machine logic
  ├── Day 3:   Bid API + validation + Socket.IO
  ├── Day 4:   Wallet API + Paystack integration
  └── Day 5:   AI Valuation API (Groq)

WEEK 3: Frontend (Public)
  ├── Day 1:   Landing page + navigation
  ├── Day 2:   Browse vehicles + search/filter
  ├── Day 3:   Vehicle detail page
  ├── Day 4:   AI valuation page
  └── Day 5:   Auth pages (login/register)

WEEK 4: Frontend (Authenticated)
  ├── Day 1-2: Auction room (live bidding UI + Socket.IO)
  ├── Day 3:   Wallet page + Paystack deposit flow
  ├── Day 4:   My Garage page
  └── Day 5:   Profile page

WEEK 5: Admin + Polish
  ├── Day 1-2: Admin dashboard + vehicle management
  ├── Day 3:   Admin auction management + user management
  ├── Day 4:   Error states, loading states, empty states
  └── Day 5:   Mobile responsive pass + final bug fixes

WEEK 6: Deploy + Demo Prep
  ├── Day 1-2: Deploy to Render, domain setup, SSL
  ├── Day 3:   Seed production data, create demo accounts
  ├── Day 4:   End-to-end testing of full flow
  └── Day 5:   Demo rehearsal
```

**Total: 6 weeks to investor-ready MVP**

---

## WHAT HAPPENS AFTER MVP

Once the MVP proves the model and secures funding:

| Month | Addition | Why |
|:---|:---|:---|
| **Month 2** | AI Reserve Protection Bidding | Increase auction success rate |
| **Month 2** | Redis caching + sessions | Performance at scale |
| **Month 3** | Dealer self-service portal | Scale supply side |
| **Month 3** | Service Hub (basic) | First post-purchase revenue |
| **Month 3** | Mobile PWA optimization | 70%+ traffic will be mobile |
| **Month 4** | Concierge system | Operational efficiency |
| **Month 4** | Import orchestration | Full pipeline value |
| **Month 5** | Upgrade marketplace | High-margin revenue |
| **Month 5** | Vector search + recommendations | Personalization |
| **Month 6** | Enterprise API | B2B revenue stream |
| **Month 6** | React Native mobile app | Native performance |

**The MVP is a wedge. The platform is the moat.**
