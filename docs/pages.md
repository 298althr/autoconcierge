# AutoConcierge — All Pages, Flows & Modals
> Last updated: 2026-02-19 | Status: Approved for MVP

---

## Design System (from UI Standard)

- **Primary Color:** `#800020` (Burgundy)
- **Surface:** `#1A1A1A` (Onyx Black)
- **Background:** `#FFFFFF` (Paper) / `#F8FAFC` (Canvas)
- **Success/ROI:** `#10B981` (Emerald Green)
- **Display Font:** `Montserrat` ExtraBold/Black
- **Body Font:** `Inter` Light/Regular/Medium/SemiBold/Bold
- **Min Touch Target:** 44×44pt (iOS) / 48×48dp (Android)
- **Border Radius:** `rounded-2xl` → `rounded-3xl` (cards), `rounded` (buttons)
- **WCAG Contrast:** ≥4.5:1 for body text (current: 12.6:1 — exceeds requirement)

---

## PUBLIC PAGES (No Auth Required)

---

### PAGE 1: Landing — `/`

**Purpose:** Hero section, featured vehicles, AI Valuation CTA. First impression.

**Sections:**
1. **Navbar** — Logo (AC mark), nav links, wallet balance (if logged in), Login/Register CTA
2. **Hero** — Headline: "Nigeria's Smartest Car Marketplace". Subtitle. CTA: "Browse Vehicles" + "Get AI Valuation"
3. **Featured Vehicles** — 6 vehicle cards (featured=true OR highest trust_score). API: `GET /api/vehicles/featured`
4. **AI Valuation Teaser** — Input: make, model, year. Button: "Get Free Valuation". Leads to `/valuation`
5. **How It Works** — 3 steps: Discover → Bid → Own
6. **Live Auctions Strip** — Horizontal scroll of active auctions with countdowns
7. **Footer** — Links, copyright

**Interactions:**
- Vehicle card click → `/vehicles/[id]`
- "Get Free Valuation" → `/valuation`
- Live auction card click → `/auctions/[id]`
- Navbar wallet balance always visible when logged in

**Empty states:**
- No featured vehicles → Show "Coming Soon" placeholder cards
- No live auctions → Show "Upcoming Auctions" with scheduled ones

---

### PAGE 2: Browse Vehicles — `/vehicles`

**Purpose:** Vehicle catalog with search, filter, sort.

**Layout:**
- Left panel (desktop) / Drawer (mobile): Filter sidebar
- Main content: Vehicle card grid (3-col desktop, 2-col tablet, 1-col mobile)
- Top: Search bar + Sort dropdown + Results count

**Filters:**
- Make (dropdown multi-select)
- Model (dropdown, depends on Make)
- Year range (min/max sliders)
- Price range (min/max inputs in ₦)
- Condition (clean / foreign_used / nigerian_used / salvage)
- Status (available / in_auction)

**Sort options:** Price (asc/desc), Year (newest), Date Listed, Trust Score

**Vehicle Card shows:**
- Primary image (Cloudinary optimized, blur-up placeholder)
- Make / Model / Year
- Price (₦ formatted)
- Condition badge
- Trust score badge (0–100, color-coded: 0-40 red, 41-70 amber, 71-100 green)
- Status pill: "Available" / "Live Auction" (with countdown)

**Pagination:** 20 per page, numbered + prev/next

**Search:** Full-text, debounced 300ms, PostgreSQL `to_tsvector`

**API:** `GET /api/vehicles?page=1&limit=20&make=Toyota&sort=price_asc&search=camry`

---

### PAGE 3: Vehicle Detail — `/vehicles/[id]`

**Purpose:** Full vehicle information + auction CTA.

**Layout:**
1. **Gallery** — Hero image (full-width) + thumbnail strip (max 10 images). Click = lightbox.
2. **Header** — Make/Model/Year/Trim, Trust Score badge (large), Condition badge
3. **Two-column (desktop):**
   - **Left:** Specs from `vehicle_catalog` (engine, displacement, horsepower, torque, transmission, fuel type). Price context (catalog market vs. listing price). AI valuation summary if available.
   - **Right:** Price card. Status: "Available" / "In Auction". If in auction: countdown + current bid + bid count. CTA: "Join Auction" or "Notify Me".
4. **Features list** (from `vehicles.features` JSONB)
5. **Damage Report** (if any, from `vehicles.damage_report` JSONB)
6. **Market Intelligence** — AI valuation block: Tokunbo price / Nigerian Used / Brand New / Investment Score / Recommendation

**Modals:**
- **Lightbox** — Full-screen image gallery with prev/next navigation
- **Notify Me** — Email input for auction start notification (guest users)

**API calls:**
- `GET /api/vehicles/:id` — vehicle + catalog specs
- `GET /api/valuations?make=X&model=Y&year=Z` — cached valuation (if exists)

---

### PAGE 4: AI Valuation Tool — `/valuation`

**Purpose:** Lead magnet. Free AI market valuation. Email-gated full report.

**Flow:**
1. **Step 1 — Input Form:**
   - Make (dropdown)
   - Model (dropdown, depends on Make)
   - Year (dropdown 2010–2026)
   - Condition (optional: clean / foreign_used / nigerian_used)
   - Mileage (optional, text input)
   - CTA: "Get Free Valuation"

2. **Step 2 — Email Gate:**
   - After submit: "Enter your email to see the full report"
   - Email input + "Send Report" button
   - Subtext: "No spam. Used for sending valuation + auction alerts only."

3. **Step 3 — Report Display:**
   - Loading state: Typing animation "AI is analyzing Nigerian market data..."
   - Success: Structured report card showing:
     - Tokunbo (foreign used) price range
     - Nigerian used price range
     - Brand new price
     - Estimated clearing cost
     - Investment Score (1-10, visual meter)
     - Recommendation: "BUY" / "HOLD" / "SELL" (color-coded pill)
     - Market trend arrow
     - Confidence level

**API:** `POST /api/valuations` with `{ make, model, year, condition, mileage_km, email }`

**Caching:** Same make+model+year+condition returns cached result (24hr TTL). No duplicate Groq calls.

---

### PAGE 5: Login — `/login`

**Fields:** Email, Password
**Actions:** Submit (POST /api/auth/login), "Forgot Password" link, "Register" link
**On Success:** Redirect to `/` or the page they were trying to access
**Errors:** "Invalid email or password" (generic — no specifics for security), "Account locked" after 10 failures
**Token:** Access token stored in memory. Refresh token set as httpOnly cookie.

---

### PAGE 6. Register (`/register`)
- **Purpose**: New user account creation.
- **Components**: RegistrationForm, SocialLogin (Optional).
- **Behavior**: Redirects to `/onboarding` upon successful account creation.

### 7. Onboarding (`/onboarding`)
- **Purpose**: Mandatory KYC data collection for all new users.
- **Fields**: Full Name, Home Address, ID Type, ID Number (Mandatory); Phone, Occupation (Optional).
- **Behavior**: Mandatory step before accessing any transactional features. Redirects to `/` or previously requested page upon completion.

---

## AUTHENTICATED PAGES (Login Required)

---

### PAGE 7: Auction Room — `/auctions/[id]`

**Purpose:** Live bidding interface. The most critical page.

**Pre-entry checks (server + client):**
- Is user authenticated? → If not, redirect to `/login`
- Is auction live? → If scheduled: show countdown to start. If ended: show result.
- Does user have sufficient wallet balance? → If not: show "Fund Your Wallet" prompt

**Layout:**
1. **Vehicle Summary** — thumbnail, make/model/year, trust score (top left)
2. **Auction Status Bar** — Current Price (large ₦ display), Bid Count, Bidder Count
3. **Countdown Timer** — Circular progress ring (UI standard recommendation B). Updates every second via Socket.IO. Color shifts: green → amber (< 10min) → red (< 2min)
4. **Bid Panel** (bottom right on desktop, fixed bottom on mobile):
   - Current bid display
   - "Your next bid" (pre-filled: current_price + bid_increment)
   - "Place Bid" button (opens confirm modal)
   - Your wallet available balance
5. **Bid Feed** — Last 10 bids (live-updating). Format: "Dapo A. bid ₦2,100,000 — 2m ago"
6. **Your Bid Status** banner — "🏆 You are winning" / "⚡ You were outbid — bid now"

**Modals:**
- **Bid Confirm Modal** — "Confirm your bid of ₦X. ₦Y (20%) will be held from your wallet." Confirm / Cancel buttons. Slide-to-confirm or double-click as anti-accident.
- **Auction Ended Modal** — "🏆 You won! Vehicle: [name]. You owe ₦X. 48 hours to complete payment." CTA: "Pay Now"
- **Outbid Modal** — "You were outbid. Current price: ₦X. New bid needed: ₦Y." CTA: "Bid Again"
- **Reserve Not Met Modal** — "Auction ended without meeting reserve price. Vehicle will be re-listed."

**Socket.IO events listened:**
- `new_bid` → update current price, bid feed, your status
- `auction_ending` → timer turns red, urgency animation
- `auction_ended` → show result modal
- `bid_error` → show error toast (insufficient balance, invalid amount, etc.)

**API:** `GET /api/auctions/:id` on page load. Then Socket.IO for real-time.

---

### PAGE 8: My Garage — `/garage`

**Purpose:** View all vehicles owned by the user.

**Layout:**
1. **Portfolio Header** — Total fleet value (sum of catalog market values), vehicle count
2. **Vehicle Cards Grid** — Per vehicle:
   - Primary image
   - Make/Model/Year
   - Purchase price vs. current catalog market value
   - ROI indicator (% gain/loss since purchase)
   - Status badge: "Owned" / "In Service" (Phase 2)
   - Acquisition date
3. **Empty State** — If no vehicles: Show featured auctions (drives engagement). Headline: "Your Garage is Empty — Win Your First Vehicle"

**Vehicle card click → `/vehicles/[id]`** (shows full specs + ownership history)

**API:** `GET /api/me/garage`

---

### PAGE 9: My Wallet — `/wallet`

**Purpose:** View balance, fund wallet, see transaction history.

**Layout:**
1. **Balance Card** (dark onyx card, UI standard style):
   - Available Balance (₦ large display)
   - Held Amount (bids in progress)
   - Total Balance
   - "Fund Wallet" button (primary, burgundy)
2. **Recent Transactions** — Last 10 rows. Each: type icon, description, amount (+/-), date, status pill
3. **"View All Transactions"** → paginated full list

**Modals:**
- **Fund Wallet Modal** — Amount input (min ₦5,000, max ₦10,000,000). "Proceed to Paystack" button. Redirects to Paystack hosted checkout. On return → balance updates.
- **Withdraw Modal** (Phase 2 for KYC-gated users)

**Transaction types display:**
- `funding` → "💳 Wallet Top-up" (green +)
- `bid_hold` → "🔒 Bid Hold — [Auction name]" (amber -)
- `bid_release` → "🔓 Hold Released — [Auction]" (green +)
- `auction_payment` → "🚗 Auction Payment — [Car name]" (red -)
- `commission` → "💼 Platform Fee" (red -)
- `refund` → "↩️ Refund" (green +)
- `withdrawal` → "🏦 Withdrawal" (red -)

**API:** `GET /api/wallet`, `POST /api/wallet/fund`, `GET /api/wallet/transactions`

---

### PAGE 10: Profile — `/profile`

**Purpose:** Edit profile details.

**Fields:**
- Display Name (text input)
- Phone (text input)
- Avatar (Cloudinary upload, crop to circle)
- Email (read-only — cannot change in MVP)
- Password (separate "Change Password" section: current password, new password, confirm)

**KYC Section:**
- Status display: "Not Submitted" / "Pending Review" / "Verified ✓" / "Rejected"
- If status = none: "Submit KYC" button (upload gov ID + selfie)
- Required for: selling vehicles, withdrawals >₦500K

**API:** `GET /api/me`, `PATCH /api/me`, `POST /api/me/kyc`

---

## ADMIN PAGES (Admin Role Only)

---

### PAGE 11: Admin Dashboard — `/admin`

**Sections:**
1. **KPI Cards** (top row): Total Revenue (₦), Active Auctions, Total Users, Pending Settlements
2. **Revenue Chart** — Bar/line chart (Chart.js), daily/weekly/monthly toggle, commission earnings over time
3. **Live Auction Monitor** — Table: Auction, Vehicle, Current Price, Bid Count, Time Remaining, Actions
4. **Recent Settlements** — Last 5 completed settlements with winner, amount, commission

**Date range filter:** Last 7 days / 30 days / Custom

**API:** `GET /api/admin/dashboard`

---

### PAGE 12: Manage Vehicles — `/admin/vehicles`

**Table columns:** Image, Make/Model, Year, Condition, Status, Price, Trust Score, Featured, Actions
**Actions:** Edit, Delist, Mark Featured, View Detail
**Top bar:** "Add Vehicle" button (opens modal)

**Add/Edit Vehicle Modal:**
- Catalog search (autocomplete: type make → model suggestions)
- Year, Condition, Mileage, Color, Price, Location
- Images upload (Cloudinary, max 10, drag-reorder)
- Features (tag input)
- Trust Score (0-100 slider, admin assigns)
- Featured toggle

**API:** `GET /api/vehicles`, `POST /api/vehicles`, `PATCH /api/vehicles/:id`

---

### PAGE 13: Manage Auctions — `/admin/auctions`

**Tabs:** All | Scheduled | Live | Ended | Settled | Cancelled

**Table columns:** Vehicle, Start Price, Current Price, Reserve, Bid Count, Start/End Time, Status, Actions

**Create Auction Panel (drawer/modal):**
- Vehicle search (only vehicles with status=available)
- Start Price, Reserve Price (optional)
- Bid Increment (default ₦50,000)
- Deposit % (default 20%)
- Commission rate (default 5%)
- Start Time (datetime picker), End Time (datetime picker)

**Admin actions per auction:**
- Force-end (emergency)
- View full bid history
- Export bid report (CSV)

**API:** `GET /api/auctions`, `POST /api/auctions`, `PATCH /api/auctions/:id`, `POST /api/admin/auctions/:id/end`

---

### PAGE 14: Manage Users — `/admin/users`

**Table:** Avatar, Name, Email, Role, Wallet Balance, KYC Status, Active Status, Joined Date, Actions
**Search:** By email or name
**Actions per user:**
- View detail (expand row or detail page)
- Activate / Deactivate account
- Approve / Reject KYC
- Manual wallet adjustment (with required reason → logged to audit)

**API:** `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `PATCH /api/admin/users/:id/kyc`

---

### PAGE 15: Transaction Ledger — `/admin/transactions`

**Filters:** Type, Status, Date Range, User search
**Table:** Date, User, Type, Amount, Balance After, Reference, Status
**Export:** CSV download

**API:** `GET /api/admin/transactions`

---

## GLOBAL COMPONENTS

### Navbar
- Logo (AC mark + "AutoConcierge")
- Public: Browse, Valuation, Login, Register
- Logged in: Browse, Valuation, Wallet Balance (₦ display), Notification bell, Avatar (dropdown: Profile, Garage, Logout)
- Admin: + "Admin" link in dropdown

### Loading States
| Action | Loading State |
|--------|---------------|
| Vehicle search | Skeleton cards (3–6 placeholders) |
| Auction room join | Full-screen: "Connecting to live feed..." spinner |
| Placing bid | Button shows spinner + "Placing bid..." (disabled) |
| Wallet balance | Skeleton balance bar |
| AI Valuation | Typing animation: "AI is analyzing market data..." |
| Page navigation | Top progress bar (NProgress-style) |

### Error/Empty States
| Scenario | State |
|----------|-------|
| No vehicles in search | "No results. Try adjusting filters." + illustration |
| Empty garage | Featured auctions (drive engagement) |
| AI Valuation failed | "Analysis unavailable. Try again in 60 seconds." |
| WebSocket disconnected | Toast: "Connection lost. Reconnecting..." (auto-retry 3x) |
| Invalid bid | Toast: specific reason (insufficient balance / auction ended / below minimum) |

### Toast Notification System
- Position: top-right (desktop), top-center (mobile)
- Types: success (green), error (red), warning (amber), info (blue)
- Auto-dismiss: 5 seconds
- Includes close button
