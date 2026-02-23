# AutoConcierge — Requirements
> Last updated: 2026-02-19 | Status: Approved for MVP

---

## 1. Problem Statement

Nigeria's used car market is:
- **Opaque** — No reliable pricing data. Buyers overpay by 15–30%
- **Trust-deficient** — No vehicle history, no verified sellers, frequent fraud
- **Fragmented** — Deals happen via WhatsApp, Instagram, word-of-mouth — no accountability
- **Inefficient** — Finding, pricing, and purchasing a car takes 2–6 weeks

**AutoConcierge solves this by:**
1. AI-powered market valuations — buyers know the fair price instantly
2. Transparent, timed auctions with real-time bidding
3. Full transaction lifecycle: bid → win → pay → own — inside one platform
4. Trust through vehicle trust scores, verified listings, and escrow-style wallet payments

---

## 2. Target Users (MVP)

| Role | Description | Access |
|------|-------------|--------|
| **Guest (Buyer)** | Anyone browsing. Can view vehicles and use AI valuation. Cannot bid. | Public pages only |
| **Authenticated Buyer** | Registered user with funded wallet. Can bid, own vehicles. | Dashboard, auctions, wallet |
| **Admin** | Platform operator. Full system control. | Everything |

> **Post-MVP roles:** Verified Seller, Dealer, Concierge, Manager

---

## 3. MVP Feature Scope

### ✅ IN SCOPE (Ship This)

| Feature | Description |
|---------|-------------|
| **User Authentication** | Email/password, JWT (access + refresh), RBAC |
| **Vehicle Catalog** | Browse, search, filter, detail pages, admin CRUD |
| **AI Valuation Tool** | Groq-powered market intelligence (Llama 3.1 70B) |
| **Live Timed Auctions** | Real-time bidding via Socket.IO |
| **Wallet System** | Fund via Paystack, hold deposits, settle payments |
| **Post-Auction Settlement** | Winner pays balance, vehicle ownership transfers |
| **User Dashboard** | Overview, garage, bid history, profile |
| **Admin Panel** | Create auctions, view revenue, manage users, audit log |
| **Email Notifications** | Bid placed, outbid, won, settlement due |

### ❌ OUT OF SCOPE (Phase 2+)

| Feature | When |
|---------|------|
| Concierge Chat System | Phase 2 (Month 2–3) |
| Service Hub (maintenance, upgrades) | Phase 2 (Month 3–4) |
| Dealer Self-Service Portal | Phase 2 (Month 3) |
| Redis Caching | Phase 2 |
| AI Reserve Protection Bidding | Phase 2 (Month 2) |
| Mobile App (React Native) | Phase 3 (Month 3–4) |
| Vector Embeddings / Semantic Search | Phase 3 |
| Multi-LLM Orchestration | Phase 3 |
| Push Notifications / PWA | Phase 2 |
| Phone OTP Authentication | Phase 2 |
| KYC for Bidding | Phase 2 (MVP: only required for selling + withdrawals >₦500K) |
| Import/Clearing Orchestration | Phase 4 |
| 3D Garage / Spatial Commerce | Phase 4 |
| Enterprise B2B Data API | Phase 4 |

---

## 4. MVP Pages (15 Total)

### Public (No Auth Required)
| Page | Route |
|------|-------|
| Landing | `/` |
| Browse Vehicles | `/vehicles` |
| Vehicle Detail | `/vehicles/[id]` |
| AI Valuation Tool | `/valuation` |
| Login | `/login` |
| Register | `/register` |

### Authenticated (User)
| Page | Route |
|------|-------|
| Auction Room | `/auctions/[id]` |
| My Garage | `/garage` |
| My Wallet | `/wallet` |
| Profile | `/profile` |

### Admin Only
| Page | Route |
|------|-------|
| Admin Dashboard | `/admin` |
| Manage Vehicles | `/admin/vehicles` |
| Manage Auctions | `/admin/auctions` |
| Manage Users | `/admin/users` |
| Transaction Ledger | `/admin/transactions` |

---

## 5. Success Criteria

| Test | Pass Condition |
|------|----------------|
| User can register and login | JWT issued, auth state persisted across refresh |
| User can browse and search vehicles | Results load <2s, filters work correctly |
| User can view AI valuation | Groq responds, structured report rendered <3s |
| User can deposit via Paystack | Wallet balance updates after webhook confirmation |
| User can join live auction and bid | Real-time update across browser tabs <500ms |
| User wins auction → vehicle appears in garage | State transitions correctly: in_auction → sold |
| Admin can create vehicle and auction | Appears on public browse page |
| Admin can see revenue dashboard | Metrics match actual transaction records |
| System rejects invalid bids | Over-capacity, under-increment, expired auction |
| System handles concurrent bids | No race conditions, correct winner determined |
| Paystack webhook is idempotent | Duplicate webhook does not double-credit wallet |
| Anti-sniping works | Bid in last 2min extends auction by 2min (max 3x) |

---

## 6. Business Rules

- Commission rate: **5% fixed** on auction final price (MVP)
- Default bid increment: **₦50,000 minimum**
- Deposit to bid: **20% of bid amount** held from wallet
- Payment deadline after winning: **48 hours**
- Wallet minimum deposit: **₦5,000**
- Wallet maximum single deposit: **₦10,000,000**
- KYC required for: selling vehicles, withdrawals >₦500,000
- KYC NOT required for: bidding (MVP)
- Anti-snipe: bid within 2 min of end → extend by 2 min (max 3 extensions)
- Vehicle cannot be in more than one active auction simultaneously
- Wallet balance can NEVER go negative
- All wallet mutations MUST be atomic (PostgreSQL transactions)
- Admin actions MUST be logged in `admin_audit_log`
- No hard deletes — soft delete only (status → archived/delisted/cancelled)
