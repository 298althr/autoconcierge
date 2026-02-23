# AutoConcierge — Implementation Plan
> Last updated: 2026-02-19 | Status: Ready to Execute

---

## Strategy: Vertical Slice Delivery

Each slice = complete feature end-to-end:
**DB schema → API route → Service logic → Frontend page → Tests → Working demo**

Every slice is independently testable and demoable before moving on.

---

## PHASE 0: Docker + Foundation (Days 1–2)

### Slice 0A: Docker Development Environment
**Goal:** Every developer can `docker-compose up` and have a working local environment.

**Files to create:**
- `docker-compose.yml` — PostgreSQL + server + client
- `.env.example` — all variables with descriptions
- `.gitignore`
- `README.md` — setup instructions

**Deliverable:** `docker-compose up` starts all services. `http://localhost:3000` shows Next.js. `http://localhost:4000` shows `{ "status": "ok" }`. PostgreSQL accessible on `localhost:5432`.

---

### Slice 0B: Project Scaffolding
**Goal:** Monorepo with correct folder structure, no code yet.

**Files:**
- Root `package.json` with workspace scripts
- `client/` — Next.js 14 initialized with TypeScript + Tailwind
- `server/` — Express.js initialized
- `client/src/styles/globals.css` — design token CSS custom props from UI standard
- `client/tailwind.config.ts` — extends design tokens
- `server/config/env.js` and `server/config/database.js`
- `server/middleware/errorHandler.js`
- `server/index.js` — bare Express server with health check

**Deliverable:** `npm run dev` in root starts both client and server.

---

### Slice 0C: Database Migrations
**Goal:** All 7 tables exist in PostgreSQL.

**Files:**
- `server/db/migrations/001_users.sql` through `007_admin_audit_log.sql`
- `server/db/migrate.js` — runs all migrations in order

**Deliverable:** `npm run migrate` creates all 7 tables with correct indexes.

---

### Slice 0D: Vehicle Catalog Seed
**Goal:** Vehicle catalog populated with Nigeria-relevant data.

**Files:**
- `server/db/seeds/catalog_seed.js` — transforms and inserts catalog data
- `server/db/seeds/demo_seed.js` — creates admin user, 5 test vehicles

**Deliverable:** `npm run seed` populates DB. Can query `SELECT COUNT(*) FROM vehicle_catalog` and see >500 rows.

---

## PHASE 1: Authentication (Days 3–4)

### Slice 1A: Auth Backend
**Goal:** Full auth API working.

**Implementation steps:**
1. `middleware/auth.js` — JWT verify middleware
2. `middleware/roles.js` — RBAC middleware
3. `middleware/validate.js` — Zod validation middleware
4. `middleware/rateLimiter.js` — IP + user limits
5. `services/authService.js` — register, login, refresh, forgot/reset password logic
6. `services/emailService.js` — SendGrid integration (verification, reset)
7. `routes/auth.js` — mount all auth routes

**Tests:** register → 201, login → 200 + token, invalid password → 401, rate limit → 429

---

### Slice 1B: Auth Frontend
**Goal:** Login and Register pages working.

**Implementation steps:**
1. `lib/auth.ts` — AuthContext, useAuth hook, token storage
2. `lib/api.ts` — fetch wrapper with auto-refresh interceptor
3. `app/login/page.tsx` — login form
4. `app/register/page.tsx` — register form
5. `components/layout/Navbar.tsx` — login/register CTAs, user avatar
6. Middleware for protected route redirects

**Deliverable:** User can register → verify email → login → see profile in navbar → logout.

---

## PHASE 2: Vehicle Catalog (Days 5–6)

### Slice 2A: Vehicle API
**Files:**
1. `services/vehicleService.js` — list (search/filter/sort), detail, create/update (admin)
2. `routes/vehicles.js` — all endpoints

---

### Slice 2B: Vehicle Frontend
**Files:**
1. `components/ui/` — Button, Input, Card, Badge, Skeleton
2. `components/vehicle/VehicleCard.tsx`
3. `components/vehicle/TrustScoreBadge.tsx`
4. `app/vehicles/page.tsx` — browse with filters, search, pagination
5. `app/vehicles/[id]/page.tsx` — detail with gallery, specs, catalog data
6. `components/vehicle/VehicleGallery.tsx` — image gallery with lightbox
7. `app/page.tsx` — landing page (hero, featured vehicles, how it works)

**Deliverable:** Can browse, search, filter vehicles. Vehicle detail shows specs. Landing page renders.

---

## PHASE 3: AI Valuation (Day 7)

### Slice 3A: Valuation API
**Files:**
1. `services/valuationService.js` — Groq integration, Zod schema, caching
2. `routes/valuations.js`

---

### Slice 3B: Valuation Frontend
**Files:**
1. `app/valuation/page.tsx` — 3-step flow (input → email gate → report)
2. `components/ValuationReport.tsx` — styled result card

**Deliverable:** Enter Toyota Camry 2022 → see AI report with prices, investment score, recommendation.

---

## PHASE 4: Wallet + Payments (Days 8–9)

### Slice 4A: Wallet API
**Files:**
1. `services/walletService.js` — balance, fund, hold, release, credit (atomic)
2. `services/paystackService.js` — initialize transaction, verify webhook signature
3. `routes/wallet.js` — wallet + webhook endpoint

**Critical:** Paystack webhook must be idempotent. Test with Paystack CLI webhook simulator.

---

### Slice 4B: Wallet Frontend
**Files:**
1. `components/wallet/BalanceCard.tsx`
2. `components/wallet/FundWalletModal.tsx`
3. `components/wallet/TransactionRow.tsx`
4. `app/wallet/page.tsx`
5. Navbar wallet balance display (update after fund)

**Deliverable:** Fund ₦50,000 → webhook received → balance shows ₦50,000. Transaction list shows entry.

---

## PHASE 5: Auction Engine (Days 10–12)

### Slice 5A: Auction Backend
**Files:**
1. `services/auctionService.js` — state machine, create, list, detail
2. `services/bidService.js` — place bid with SELECT FOR UPDATE, anti-snipe logic
3. `services/socketService.js` — Socket.IO room management, event broadcasting
4. `jobs/auctionCron.js` — activate and end auctions
5. `routes/auctions.js` + `routes/bids.js`
6. Socket.IO setup in `index.js`

**Load test:** Simulate 10 concurrent bids → verify only 1 wins, no race condition.

---

### Slice 5B: Auction Frontend
**Files:**
1. `hooks/useSocket.ts` — Socket.IO connection management
2. `hooks/useAuction.ts` — auction state, bid feed
3. `components/auction/AuctionTimer.tsx` — countdown with color states
4. `components/auction/BidPanel.tsx` — bid input + confirm modal
5. `components/auction/BidFeed.tsx` — live bid history
6. `components/auction/BidConfirmModal.tsx`
7. `app/auctions/[id]/page.tsx` — full auction room
8. Landing page auction strip (live auctions with countdowns)

**Deliverable:** Open auction room in 2 browser tabs → place bid in one → other tab updates in <500ms.

---

## PHASE 6: Settlement + User Dashboard (Days 13–14)

### Slice 6A: Post-Auction Settlement
**Files:**
1. `services/settlementService.js` — winner payment, vehicle transfer, commission
2. `jobs/settlementCron.js` — 48hr timeout enforcement

---

### Slice 6B: User Dashboard Pages
**Files:**
1. `app/garage/page.tsx` — vehicle portfolio
2. `app/profile/page.tsx` — profile edit, KYC upload
3. `routes/me.js` — garage, bids, profile update, KYC
4. `app/me/bids` — bid history

**Deliverable:** User wins auction → vehicle appears in garage. Profile editable. KYC uploadable.

---

## PHASE 7: Admin Panel (Days 15–17)

### Slice 7A: Admin API
**Files:**
1. `routes/admin.js` — dashboard, users, audit log
2. Admin-specific logic in auctionService, vehicleService

---

### Slice 7B: Admin UI
**Files:**
1. `components/layout/AdminSidebar.tsx`
2. `app/admin/page.tsx` — dashboard with KPIs + charts
3. `app/admin/vehicles/page.tsx` — CRUD table + add modal
4. `app/admin/auctions/page.tsx` — create + monitor
5. `app/admin/users/page.tsx` — manage + KYC actions
6. `app/admin/transactions/page.tsx` — ledger

**Deliverable:** Admin can create vehicle → create auction → monitor live → see settlement in ledger.

---

## PHASE 8: Polish + Hardening (Days 18–19)

- [ ] All loading states (skeleton screens for every async operation)
- [ ] All error states (toast for every possible failure)
- [ ] All empty states
- [ ] Full mobile responsive pass (320px → 1440px)
- [ ] Paystack IP whitelist for webhook
- [ ] Helmet security headers verified
- [ ] Input sanitization audit
- [ ] Rate limit testing
- [ ] 48hr settlement timeout test
- [ ] Anti-snipe extension test
- [ ] Race condition test (concurrent bids)
- [ ] JWT refresh works correctly
- [ ] Webhook idempotency test

---

## PHASE 9: Deploy (Days 20–21)

1. Create `render.yaml`
2. Push to GitHub main branch
3. Render auto-deploys
4. Set all environment variables in Render dashboard
5. Run `npm run migrate` (once via Render shell)
6. Run `npm run seed` (once via Render shell)
7. Register Paystack webhook URL: `https://api.autoconcierge.ng/api/wallet/webhook`
8. Create demo admin account
9. Create 5 demo vehicles
10. Create 2 live auctions for investor demo
11. Smoke test all 15 pages
12. Load test auction room with 10 simulated users

---

## Status Tracking

| Slice | Status | Notes |
|-------|--------|-------|
| 0A Docker | 🔴 Not Started | |
| 0B Scaffolding | 🔴 Not Started | |
| 0C Migrations | 🔴 Not Started | |
| 0D Seed | 🔴 Not Started | |
| 1A Auth Backend | 🔴 Not Started | Needs: SendGrid API key |
| 1B Auth Frontend | 🔴 Not Started | |
| 2A Vehicle API | 🔴 Not Started | |
| 2B Vehicle Frontend | 🔴 Not Started | Needs: Cloudinary |
| 3A Valuation API | 🔴 Not Started | Needs: Groq API key |
| 3B Valuation Frontend | 🔴 Not Started | |
| 4A Wallet API | 🔴 Not Started | Needs: Paystack keys |
| 4B Wallet Frontend | 🔴 Not Started | |
| 5A Auction Backend | 🔴 Not Started | |
| 5B Auction Frontend | 🔴 Not Started | |
| 6A Settlement | 🔴 Not Started | |
| 6B User Dashboard | 🔴 Not Started | |
| 7A Admin API | 🔴 Not Started | |
| 7B Admin UI | 🔴 Not Started | |
| 8 Polish | 🔴 Not Started | |
| 9 Deploy | 🔴 Not Started | |

Legend: 🔴 Not Started | 🟡 In Progress | 🟢 Complete | ⛔ Blocked
