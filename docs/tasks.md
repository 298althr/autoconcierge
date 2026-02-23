# AutoConcierge — Tasks
> Living document. Updated after every completed slice.

---

## [2026-02-21] Session 7: Design Pivot & Email Integration

### 🎯 Milestone: Brand Maturity & Notification Layer
**Status:** ✅ Completed

**Branding & UI Overhaul:**
- ✅ **Pivot to Minimalist Light Mode:** Completely refactored `globals.css` and `tailwind.config.ts` to favor a clean, premium white/surface aesthetic over the previous dark mode.
- ✅ **Header & Logo:** Integrated the specified light-mode image logo and refactored the `Navbar` to a minimalist fixed-width container.
- ✅ **16:9 Hero Section:** Redesigned the landing page hero to perfectly fill a 16:9 viewport.
- ✅ **Copyright Safety:** Swapped branded vehicle images for a custom-generated minimalist brandless vector.
- ✅ **Dynamic Headlines:** Implemented a sophisticated text-swapping headline logic for the hero section.

**Phase 1-E (Notification System):**
- ✅ **SendGrid Integration:** Created `server/services/emailService.js` with HTML templates for Welcome, Outbid, Auction Won, and Payment Success events.
- ✅ **Lifecycle Hooks:** Embedded email triggers into `AuthService`, `BidService`, `AuctionService`, and `SettlementService`.
- ✅ **Security:** Added Zod validation for new SendGrid environment variables.

**Decisions Made:**
- **Viewport Constraints:** Explicitly used `calc(100dvh - 4rem)` for the hero to ensure a pixel-perfect "above the fold" experience.
- **Mock Fallback:** Configured the email service to log to the console when API keys are missing, preventing crash-loops in dev environments.

**Next Steps:**
- Phase 2-Q: Cloudinary Integration for vehicle uploads.
- **Phase 3 (AI Valuation)**: 🟢 Completed (Groq Llama 3.3 Integration).
- **Phase 9: Deployment**: 🟡 In Progress (Railway configs pending).

## [2026-02-22] Session 8: Stability, Bug Fixes & Concurrency

### 🎯 Milestone: Local Production Simulation
**Status:** ✅ Completed

**Bug & Stability Fixes:**
- ✅ **Docker Installation Failure:** Fixed `Dockerfile.dev` to enforce strict `--legacy-peer-deps`, unblocking a deadly silent crash cycle where `index.js` was blowing up due to a missing `@sendgrid/mail` module upon container spin-up.
- ✅ **Network Host Bypassing:** Windows local TCP/IPv6 binding issues permanently resolved by swapping Express `.listen` target to `0.0.0.0` and mapping variables explicitly to `127.0.0.1` over `localhost` aliases.
- ✅ **Login Crash (DB Schema Match):** Successfully corrected the `bcrypt.compare` failure (`String, undefined`) passing through `authService.js` by targeting the verified `user.password_hash` column over `user.password`. 
- ✅ **Auth Destructuring Error:** Fixed the Red UI exception thrown during login; corrected React's `AuthContext.tsx` payload parsing away from `response.data.user` to pure `response.user`.
- ✅ **Favicon 404:** Quieted browser noise via basic `favicon.ico` hydration.

**Concurrency Load Testing:**
- ✅ **Autocannon Benchmark:** Shot 15k connection requests sequentially against the server. Process verified `express-rate-limit` instantly rejects DDoS flooding (returning `429 Too Many Requests`). Concluded native Docker scale is not accurately able to process 10,000 real-time users simultaneously; load testing must shift to the production Kubernetes environment (Phase 9).

**Next Steps:**
- **Phase 9: Deployment**: 🟡 In Progress (Targeting Railway.app execution).

---

## BACKLOG (All Tasks)

### PHASE 0 — FOUNDATION

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 0A | Docker Compose setup (PG + server + client) | 🟢 | — |
| 0B | Next.js 14 + TypeScript + Tailwind scaffolding | 🟢 | — |
| 0C | Express.js server scaffolding + health check | 🟢 | — |
| 0D | Design token CSS + Tailwind config from UI standard | 🟢 | — |
| 0E | Database migrations (all 7 tables) | 🟢 | — |
| 0F | Vehicle catalog seed script | 🟢 | — |
| 0G | Demo seed (admin user + 5 vehicles) | 🟢 | — |

### PHASE 1 — AUTHENTICATION

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 1A | JWT middleware (auth + roles) | 🟢 | 0C |
| 1B | Zod validation middleware | 🟢 | 0C |
| 1C | Rate limiter middleware | 🔴 | 0C |
| 1D | Auth service (register, login, refresh, reset) | 🟢 | 1A |
| 1E | SendGrid email service | 🟢 | — |
| 1F | Auth routes (register, login, refresh, logout, forgot, reset, verify) | 🟢 | 1D |
| 1G | Auth context + API client (frontend) | 🟢 | 1F |
| 1H | Login page UI | 🟢 | 1G |
| 1I | Register page UI | 🟢 | 1G |
| 1J | Navbar component (auth state) | 🟢 | 1G |
| 1K | Protected route middleware (Next.js) | 🟢 | 1G |

### PHASE 2 — VEHICLE CATALOG

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 2A | Vehicle service (list, search, filter, detail) | 🟢 | 0E |
| 2B | Vehicle routes (GET /vehicles, GET /vehicles/:id) | 🟢 | 2A |
| 2C | Admin vehicle routes (POST, PATCH) | 🔴 | 2A, 1A |
| 2D | UI component: Button | 🟢 | 0D |
| 2E | UI component: Input, Select | 🟡 | 0D |
| 2F | UI component: Card | 🟢 | 0D |
| 2G | UI component: Badge | 🟢 | 0D |
| 2H | UI component: Skeleton | 🟡 | 0D |
| 2I | UI component: Toast | 🔴 | 0D |
| 2J | UI component: Modal | 🔴 | 0D |
| 2K | VehicleCard component | 🟢 | 2F, 2G |
| 2L | TrustScoreBadge component | 🟢 | 2G |
| 2M | Browse Vehicles page (/vehicles) | 🟢 | 2B, 2K |
| 2N | Vehicle Detail page (/vehicles/[id]) | 🟢 | 2B, 2K |
| 2O | VehicleGallery with lightbox | 🟡 | 2N |
| 2P | Landing page (/ homepage) | 🟢 | 2M, 2B |
| 2Q | Cloudinary integration (image upload) | 🟢 | — |

### PHASE 3 — AI VALUATION

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 3A | AI Valuation service (Groq driver) | 🟢 | — |
| 3B | Algorithmic fallback logic | 🟢 | 3A |
| 3C | Valuation routes (POST /predict, GET /history) | 🟢 | 3B |
| 3D | AI Valuation page (/valuation) | 🟢 | 3C |
| 3E | Result sharing UI (Socials) | 🔴 | 3D |

### PHASE 4 — WALLET + PAYMENTS

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 4A | Wallet service (balance, hold, release, credit — atomic) | 🟢 | 0E |
| 4B | Paystack service (initialize, webhook verify) | 🟢 | — |
| 4C | Wallet routes (GET /wallet, POST /wallet/fund, POST /wallet/webhook, GET /wallet/transactions) | 🟢 | 4A, 4B |
| 4D | Wallet page UI (/wallet) | 🟢 | 4C |
| 4E | FundWalletModal component | 🟢 | 4D |
| 4F | TransactionRow component | 🟢 | 4D |
| 4G | Navbar wallet balance display | 🟢 | 4C |
| 4H | Manual Bank Transfer Funding (UI + API) | 🟢 | 4A |
| 4I | Admin Approval/Decline logic for manual funds | 🟢 | 4H |
| 4J | 24h Auto-Decline background task | 🟢 | 4I |

### PHASE 5 — AUCTION ENGINE

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 5A | Auction service (state machine, create, list, detail) | 🟢 | 0E |
| 5B | Bid service (SELECT FOR UPDATE, anti-snipe, concurrent bids) | 🟢 | 5A, 4A |
| 5C | Socket.IO setup in server index.js | 🟢 | 0C |
| 5D | Socket service (rooms, broadcast events) | 🟢 | 5C |
| 5E | Auction cron (activate + end auctions every 1min) | 🟢 | 5A |
| 5F | Auction routes (GET /auctions, GET /auctions/:id, POST /auctions, POST /auctions/:id/bid) | 🟢 | 5A, 5B |
| 5G | useSocket hook (frontend) | 🟢 | 5C |
| 5H | useAuction hook (frontend) | 🟢 | 5G |
| 5I | AuctionTimer component | 🟢 | 5H |
| 5J | BidPanel component | 🟢 | 5H |
| 5K | BidFeed component | 🟢 | 5H |
| 5L | BidConfirmModal component | 🟢 | 5J |
| 5M | Auction Room page (/auctions/[id]) | 🟢 | 5I, 5J, 5K |
| 5N | Landing page: live auctions strip | 🟢 | 5F |
| 5O | Vehicle detail: auction CTA panel | 🟢 | 5F |

### PHASE 6 — SETTLEMENT + USER DASHBOARD

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 6A | Settlement service (winner payment, vehicle transfer, commission) | 🟢 | 5B, 4A |
| 6B | Settlement cron (48hr timeout enforcement) | 🟢 | 6A |
| 6C | User routes (GET /me, PATCH /me, GET /me/garage, GET /me/bids, POST /me/kyc) | 🟢 | 0E |
| 6D | Onboarding/KYC page (/onboarding) | 🟢 | 6C |
| 6E | My Garage page (/garage) | 🟢 | 6C |
| 6F | Profile page (/profile) | 🟢 | 6C |
| 6G | Bid History section | 🟢 | 6C |

### PHASE 7 — ADMIN PANEL

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 7A | Admin routes (dashboard, users, audit log, KYC actions) | 🟢 | 0E, 1A |
| 7B | AdminSidebar component | 🟢 | 0D |
| 7C | Admin Dashboard page (/admin) | 🟢 | 7A, 7B |
| 7D | Admin Vehicles page (/admin/vehicles) | 🟢 | 7A, 7B |
| 7E | Admin Auctions page (/admin/auctions) | 🟢 | 7A, 7B |
| 7F | Admin Users page (/admin/users) | 🟢 | 7A, 7B |
| 7G | Admin Transactions page (/admin/transactions) | 🟢 | 7A, 7B |

### PHASE 8 — POLISH

| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 8A | All loading states (skeleton screens) | 🟢 | Phase 7 complete |
| 8B | All error states + toast messages | 🟢 | Phase 7 complete |
| 8C | All empty states | 🟢 | Phase 7 complete |
| 8D | Full mobile responsive audit (320px–1440px) | 🟢 | Phase 7 complete |
| 8E | Security audit (helmet, CORS, rate limits) | 🟢 | Phase 7 complete |
| 8F | Concurrent bid race condition test | 🟢 | 5B |
| 8G | Webhook idempotency test | 🟢 | 4C |
| 8H | Anti-snipe extension test | 🟢 | 5B |
| 8I | 48hr settlement timeout test | 🟢 | 6B |

### PHASE 9 — DEPLOY
| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 9A | Railway configuration (Railway.toml) | 🔴 | Phase 8 complete |
| 9B | Create Railway services (DB + API + Web) | 🔴 | 9A |
| 9C | Set all env vars in Railway | 🔴 | 9B |
| 9D | Run migrations on production | 🔴 | 9C |
| 9E | Run seed on production | 🔴 | 9D |
| 9F | Register Paystack webhook URL | 🔴 | 9B |
| 9G | Create demo content (vehicles + live auctions) | 🔴 | 9E |
| 9H | Full smoke test of all 15 pages on production | 🔴 | 9G |
| 9I | Create GitHub Issues for all tasks | 🟢 | — |

### PHASE 10 — OPEN SOURCE INTEGRATIONS (POST-MVP)
| ID | Task | Status | Blocked By |
|----|------|--------|-----------|
| 10A | Integrate ilyasozkurt/automobile-models-and-specs | 🔴 | Phase 9 complete |
| 10B | Configure Twilio-KYC Next.js App (Termii/Smile ID) | 🔴 | Phase 9 complete |
| 10C | Integrate Drdaria25/car-dealer-app vehicle filtering | 🔴 | 10A |
| 10D | Evaluate Redis transition via dineshkn-dev/live-bidding | 🔴 | Phase 9 complete |

---

## COMPLETED

- docs/requirements.md, stack.md, pages.md, api.md, architecture.md, plans.md, tasks.md
- Initial project structure & 7-table schema
- GitHub labels and 14 planning issues
- Design system tokens (Burgundy/White)
- Express server scaffolding
- Database migrations & seed scripts
- Phase 1-E: SendGrid Email Integration

---

## BLOCKED — Awaiting External

| ID | Task | Waiting For |
|----|------|-------------|
| 2Q | Cloudinary image upload | Cloudinary credentials |
| 3A | Groq AI valuation | Groq API key |
| 4B | Paystack service | Paystack keys |

Legend: 🔴 Not Started | 🟡 In Progress | 🟢 Complete | ⛔ Blocked
