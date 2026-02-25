# Autogaard — Memory Management & Progress Tracker
# ============================================================
# PURPOSE: This is the single source of truth for project state.
# READ THIS FILE at the start of EVERY session before doing anything.
# UPDATE THIS FILE after every completed slice/task.
# ============================================================

## 🧠 CORE GOAL (Never Forget)
Build and deploy Autogaard — Nigeria's AI-powered used car marketplace —
from empty folder to Railway.app production. Full vertical slice delivery.
Zero stones unturned.

## 📍 DEPLOYMENT TARGET
**Production: Railway.app** (NOT Render.com — docs/deployment.md updated to reflect this)
- PostgreSQL plugin on Railway
- server/ → Railway web service
- client/ → Railway web service (or static)

## 🔑 API KEYS STATUS (Update when received)
| Service | Status | Notes |
|---------|--------|-------|
| PostgreSQL | 🟢 Operational | Live on Railway (with Migrations) |
| Paystack | 🟢 Operational | Wired for Production/Test mode |
| Groq | 🟢 Operational | llama-3.3-70b-versatile active |
| Cloudinary | 🟢 Operational | Production assets active |
| SendGrid | 🟡 Integrated | Testing verified, awaiting prod key |

## 🏗️ ARCHITECTURE DECISIONS (Locked — Do Not Change)
- Stack: Node.js 20 + Express 4 (server) + Next.js 14 TypeScript (client)
- DB: PostgreSQL 16 — single instance, 7 tables
- Real-time: Socket.IO 4 (no Redis, no Pub/Sub for MVP)
- Auth: Custom JWT — access token in memory (15min) + refresh httpOnly cookie (7d)
- Images: Cloudinary only (no S3)
- AI: Groq SDK Node.js — Llama 3.1 70B — Zod schema enforcement
- Payments: Paystack API v2 — HMAC-SHA512 webhook verification
- Email: SendGrid v3
- Styling: Tailwind CSS + CSS custom properties for design tokens
- Design tokens: Primary #800020 (Burgundy), Surface #1A1A1A, BG #F8FAFC, Success #10B981
- Fonts: Montserrat (display) + Inter (body) from Google Fonts
- NO: Redis, Docker-in-prod, GraphQL, Firebase, Python, Microservices

## 📋 7 CORE SYSTEMS (Full Coverage Required)
1. Identity & Auth → users table → /api/auth/*
2. Vehicle Catalog → vehicle_catalog + vehicles → /api/vehicles/*
3. Auction Engine → auctions + bids → /api/auctions/* + Socket.IO
4. Wallet & Payments → transactions + users.wallet_balance → /api/wallet/*
5. AI Valuation → valuations → /api/valuations/*
6. User Dashboard → /api/me/* → garage + bids + profile
7. Admin Operations → admin_audit_log → /api/admin/*

## 📄 15 PAGES (All Must Ship)
PUBLIC: Landing(/), Browse(/vehicles), Detail(/vehicles/[id]), Valuation(/valuation), Login(/login), Register(/register)
AUTH: AuctionRoom(/auctions/[id]), Garage(/garage), Wallet(/wallet), Profile(/profile)
ADMIN: Dashboard(/admin), Vehicles(/admin/vehicles), Auctions(/admin/auctions), Users(/admin/users), Ledger(/admin/transactions)

- docker-compose.yml: ✅ OPTIMIZED (Linux-native binaries)
- KYC System: ✅ MANDATORY Onboarding for all users
- Manual Funding: ✅ OPERATIONAL (Providus Bank)

## 📁 DOCS WRITTEN (Do not rewrite these — they are complete)
- docs/requirements.md ✅
- docs/stack.md ✅
- docs/pages.md ✅
- docs/api.md ✅
- docs/architecture.md ✅ (includes full SQL schema for all 7 tables)
- docs/plans.md ✅ (9 phases, 20 slices, every file listed)
- docs/tasks.md ✅ (every task with status + blockers)
- docs/deployment.md ✅ (Railway.app + Docker + env vars)
- docs/ai-logs.md ✅
- docs/github-issues.md ✅
- README.md ✅
- .gitignore ✅
- .env.example ✅
- package.json ✅ (root monorepo)
- docker-compose.yml ✅

## 🐙 GITHUB STATUS
Repository: https://github.com/298althr/Autogaard
Labels: ✅ 15 Created (via PS script)
Issues: ✅ 14 Created (via PS script)

## 📊 PROGRESS SCORE: 100 / 100

### Scoring Breakdown (100 points total)
| Phase | Points | Earned | Status |
|-------|--------|--------|--------|
| **Docs & Setup** | 10 | 10 | ✅ COMPLETE |
| **Phase 0: Foundation** | 8 | 8 | ✅ COMPLETE |
| **Phase 1: Auth** | 10 | 10 | ✅ COMPLETE |
| **Phase 2: Vehicles** | 10 | 10 | ✅ COMPLETE |
| **Phase 3: AI Valuation** | 8 | 8 | ✅ COMPLETE |
| **Phase 4: Wallet** | 10 | 10 | ✅ COMPLETE |
| **Phase 5: Auctions** | 15 | 15 | ✅ COMPLETE |
| **Phase 6: Settlement+Dashboard** | 8 | 8 | ✅ COMPLETE |
| **Phase 7: Admin** | 8 | 8 | ✅ COMPLETE |
| **Phase 8: Polish** | 8 | 8 | ✅ COMPLETE |
| **Phase 9: Deploy** | 5 | 5 | ✅ COMPLETE |
| **TOTAL** | **100** | **100** | ✅ 100% Core MVP Complete |

### Score Milestones
- **20/100** → Ready to push first code to GitHub ✅
- **40/100** → Auth + Vehicles working locally ✅
- **60/100** → Wallet funded, auction live locally (demo-ready prototype)
- **80/100** → All 15 pages built, all 7 systems working
- **95/100** → Production deployed on Railway, smoke tested
- **100/100** → Load tested, security hardened, investor demo ready

## 🔄 CURRENT SESSION STATE
Last action: **Session 12: Client Dashboard & Strategy Pivot**

### 📌 Current Session State
- **Phase 11 (OAuth Final Loop)**: 🟢 Completed. Google SSO is live in production. Handshake and origin mismatches have been resolved on Railway.
- **Workflow Pivot**: 
  - KYC logic is being deferred: Onboarding will NOT ask for ID verification initially. KYC triggers only on transactions > ₦500k. Smile ID / Termii APIs will be evaluated.
  - Valuation Engine: Shifting from free-text inputs to an interactive Wizard based on scraped DB data (Make -> Model -> Year).
  - Client Dashboard: Redefining Phase 6 from basic profile pages to a full-fledged client portal (Wallet, Active Bids, Garage, Logout).
- **Next Step**: **Session 12: Client Dashboard Scaffold (Planning Phase)** - Finalizing the exact layout parameters and component structure for the portal before implementation.

## 📌 BUSINESS RULES (Never Forget These)
- Commission: 5% of final auction price
- Bid increment min: ₦50,000
- Bid deposit hold: 20% of bid amount from wallet
- Payment deadline post-win: 48 hours
- Anti-snipe: bid in last 2min → extend 2min (max 3 extensions)
- Wallet min deposit: ₦5,000 | max: ₦10,000,000
- Wallet balance CANNOT go negative — ever
- All wallet mutations MUST be PostgreSQL atomic transactions
- Soft deletes ONLY — no hard deletes in the system
- All admin actions logged to admin_audit_log (append-only)
- KYC Deferral: NOT required to create an account. Required only when cumulative transactions cross ₦500,000.
- Manual Funding Confirmation: Average 1 hour.
- Auto-Decline: Manual funding requests expire in 24 hours if not approved.
- Transaction States: pending, processing, completed, failed.

## ⚡ VERTICAL SLICE RULE
Every feature MUST be delivered as:
DB schema → API route → Service logic → Frontend page/component → Tests → Working demo
Do NOT build all backend then all frontend. One feature at a time, end to end.

## 🚫 PHASE 2 FEATURES (Do NOT implement in MVP)
- Concierge page / chat (WhatsApp for now)
- Services Hub / partner matching
- Redis caching
- Push notifications / PWA
- Phone OTP auth
- Dealer self-service portal
- Mobile app (React Native)

## 📝 HOW TO USE THIS FILE
At the start of any new session:
1. Read this file completely
2. Check the PROGRESS SCORE to know where we are
3. Find the last completed task in docs/tasks.md
4. Continue from the next task
5. Update this file + docs/tasks.md after each completed slice

