# AutoConcierge — API Contracts
> Last updated: 2026-02-19 | Status: Approved for MVP
> Base URL: `http://localhost:4000` (dev) | `https://api.autoconcierge.ng` (prod)

---

## CONVENTIONS

- All requests/responses: `Content-Type: application/json`
- Authentication: `Authorization: Bearer <access_token>` header
- Refresh token: `httpOnly` cookie named `refresh_token`
- All amounts: in **Naira (₦)**, stored as `DECIMAL(15,2)`
- All dates: UTC ISO 8601 (`2026-02-19T10:00:00.000Z`)
- Pagination: `{ data: [...], pagination: { page, limit, total, pages } }`
- Errors: `{ error: "message", code: "ERROR_CODE", details?: {} }`
- Success: `{ success: true, data: {...} }` or `{ success: true, message: "..." }`

---

## 1. AUTHENTICATION

### POST /api/auth/register
**Auth:** None | **Rate Limit:** 10/hr per IP

**Request:**
```json
{
  "email": "dapo@example.com",
  "password": "SecurePass1",
  "display_name": "Dapo Adeleke",
  "phone": "+2348012345678"
}
```

**Validation:**
- `email`: valid format, unique in DB
- `password`: min 8 chars, 1 uppercase, 1 number
- `display_name`: required, 2–100 chars
- `phone`: optional, Nigerian format

**Response 201:**
```json
{
  "success": true,
  "message": "Account created. Check your email to verify.",
  "data": {
    "id": "uuid",
    "email": "dapo@example.com",
    "display_name": "Dapo Adeleke",
    "role": "user"
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `409 EMAIL_EXISTS`

---

### POST /api/auth/login
**Auth:** None | **Rate Limit:** 5/15min per IP

**Request:**
```json
{ "email": "dapo@example.com", "password": "SecurePass1" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "dapo@example.com",
      "display_name": "Dapo Adeleke",
      "role": "user",
      "wallet_balance": "150000.00",
      "email_verified": true,
      "avatar_url": "https://res.cloudinary.com/..."
    }
  }
}
```
**Cookie set:** `refresh_token` (httpOnly, Secure, SameSite=Strict, 7d)

**Errors:** `401 INVALID_CREDENTIALS`, `403 ACCOUNT_LOCKED`, `403 ACCOUNT_INACTIVE`

---

### POST /api/auth/refresh
**Auth:** `refresh_token` cookie | **Rate Limit:** 30/hr per user

**Request:** No body (cookie is read automatically)

**Response 200:**
```json
{
  "success": true,
  "data": { "access_token": "eyJ..." }
}
```

**Errors:** `401 INVALID_REFRESH_TOKEN`, `401 REFRESH_TOKEN_EXPIRED`

---

### POST /api/auth/logout
**Auth:** Required

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully" }
```
Cookie cleared. Token blacklisted server-side until expiry.

---

### POST /api/auth/forgot-password
**Auth:** None

**Request:** `{ "email": "dapo@example.com" }`

**Response 200:** `{ "success": true, "message": "If that email exists, a reset link was sent." }`

Note: Always returns 200 (prevents email enumeration).

---

### POST /api/auth/reset-password
**Auth:** None (uses reset token from email)

**Request:**
```json
{
  "token": "uuid-reset-token",
  "password": "NewSecurePass1"
}
```

**Response 200:** `{ "success": true, "message": "Password updated. Please log in." }`

**Errors:** `400 INVALID_TOKEN`, `400 TOKEN_EXPIRED`

---

### POST /api/auth/kyc/submit
**Auth:** Required
**Purpose:** Submit KYC data during onboarding.

**Request:**
```json
{
  "full_name": "Dapo Adeleke",
  "address": "123 Lekki Phase 1, Lagos",
  "id_type": "NIN",
  "id_number": "12345678901",
  "phone": "+2348012345678",
  "occupation": "Software Engineer"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "KYC submitted successfully"
}
```
**Side effect:** `users.kyc_status` → `pending`

---

## 2. VEHICLES

### GET /api/vehicles
**Auth:** None | **Cache:** SWR on frontend (30s stale)

**Query params:**
| Param | Type | Example |
|-------|------|---------|
| `page` | int | `1` |
| `limit` | int | `20` (max 50) |
| `search` | string | `camry` |
| `make` | string | `Toyota` |
| `model` | string | `Camry` |
| `year_min` | int | `2018` |
| `year_max` | int | `2023` |
| `price_min` | number | `5000000` |
| `price_max` | number | `25000000` |
| `condition` | string | `clean,foreign_used` |
| `status` | string | `available,in_auction` |
| `sort` | string | `price_asc,price_desc,year_desc,trust_score_desc` |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "trim": "XSE",
      "year": 2022,
      "condition": "clean",
      "price": 18500000,
      "status": "available",
      "trust_score": 85,
      "featured": false,
      "location": "Lagos",
      "images": ["https://res.cloudinary.com/..."],
      "catalog": {
        "horsepower": 203,
        "transmission": "Automatic",
        "displacement_cc": 2487
      },
      "active_auction": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 147, "pages": 8 }
}
```

---

### GET /api/vehicles/featured
**Auth:** None

Returns top 6 featured or highest trust_score vehicles.

**Response 200:** Same vehicle shape as above, array of 6.

---

### GET /api/vehicles/:id
**Auth:** None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "trim": "XSE",
    "year": 2022,
    "vin": "1HGBH41JXMN109186",
    "condition": "clean",
    "mileage_km": 24000,
    "color": "Pearl White",
    "price": 18500000,
    "status": "in_auction",
    "images": ["url1", "url2", "url3"],
    "features": ["Leather seats", "Sunroof", "Blind spot monitor"],
    "damage_report": {},
    "trust_score": 85,
    "featured": false,
    "location": "Lagos",
    "catalog": {
      "make": "Toyota", "model": "Camry",
      "horsepower": 203, "torque_nm": 252,
      "displacement_cc": 2487, "transmission": "8-speed Automatic",
      "fuel_type": "Petrol", "drivetrain": "FWD",
      "price_foreign_used": 14000000,
      "price_nigerian_used": 17000000,
      "price_brand_new": 24000000
    },
    "active_auction": {
      "id": "uuid",
      "status": "live",
      "current_price": 19000000,
      "bid_count": 12,
      "end_time": "2026-02-20T18:00:00.000Z"
    }
  }
}
```

---

### POST /api/vehicles
**Auth:** Admin only

**Request:**
```json
{
  "catalog_id": "uuid",
  "year": 2022,
  "condition": "clean",
  "price": 18500000,
  "mileage_km": 24000,
  "color": "Pearl White",
  "location": "Lagos",
  "images": ["https://res.cloudinary.com/..."],
  "features": ["Leather seats", "Sunroof"],
  "trust_score": 85,
  "featured": false
}
```

**Response 201:** `{ "success": true, "data": { ...vehicle } }`

**Errors:** `400 VALIDATION_ERROR`, `404 CATALOG_NOT_FOUND`, `403 NOT_ADMIN`

---

### PATCH /api/vehicles/:id
**Auth:** Admin only | Partial update

**Request:** Any subset of POST fields. Cannot change `catalog_id` or `owner_id`.

**Response 200:** `{ "success": true, "data": { ...updated_vehicle } }`

---

## 3. AUCTIONS

### GET /api/auctions
**Auth:** None

**Query params:** `status` (live,scheduled,ended), `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "live",
      "start_price": 15000000,
      "current_price": 19000000,
      "reserve_price": 18000000,
      "bid_increment": 50000,
      "bid_count": 12,
      "bidder_count": 5,
      "start_time": "...",
      "end_time": "...",
      "vehicle": {
        "id": "uuid",
        "make": "Toyota", "model": "Camry", "year": 2022,
        "images": ["url1"],
        "trust_score": 85
      }
    }
  ],
  "pagination": { ... }
}
```

---

### GET /api/auctions/:id
**Auth:** None

Returns full auction + vehicle + last 20 bids.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "live",
    "current_price": 19000000,
    "bid_increment": 50000,
    "deposit_pct": 20,
    "bid_count": 12,
    "snipe_extensions": 0,
    "end_time": "...",
    "vehicle": { ...full vehicle object },
    "bids": [
      {
        "id": "uuid",
        "amount": 19000000,
        "bidder_name": "D. A.",
        "is_winning": true,
        "created_at": "..."
      }
    ],
    "socket_room": "auction:uuid"
  }
}
```

---

### POST /api/auctions
**Auth:** Admin only

**Request:**
```json
{
  "vehicle_id": "uuid",
  "start_price": 15000000,
  "reserve_price": 18000000,
  "bid_increment": 50000,
  "deposit_pct": 20,
  "commission_rate": 0.05,
  "start_time": "2026-02-20T10:00:00.000Z",
  "end_time": "2026-02-20T18:00:00.000Z"
}
```

**Validation:**
- vehicle exists + status = `available`
- `start_time` > now
- `end_time` > `start_time`

**Response 201:** `{ "success": true, "data": { ...auction } }`
**Side effect:** Vehicle status → `in_auction`

---

### POST /api/auctions/:id/bid
**Auth:** Required (user or admin)

**Request:**
```json
{ "amount": 19050000 }
```

**Validation (server):**
1. Auction status = `live`
2. `amount` > `current_price + bid_increment`
3. User wallet available_balance >= `amount * deposit_pct / 100`
4. User is NOT the auction creator
5. Row lock on auction (`SELECT FOR UPDATE`)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "bid_id": "uuid",
    "amount": 19050000,
    "is_winning": true,
    "new_end_time": "2026-02-20T18:02:00.000Z"
  }
}
```

**Side effects:**
- `auctions.current_price` updated
- `auctions.bid_count` incremented
- Previous winning bid: `is_winning = false`
- New bid: `is_winning = true`
- Deposit held from wallet: `transaction` type=`bid_hold`
- If anti-snipe triggered: `end_time` extended 2min, `snipe_extensions` incremented
- Socket.IO broadcast to all in room

**Errors:** `400 BID_TOO_LOW`, `400 INSUFFICIENT_BALANCE`, `400 AUCTION_NOT_LIVE`, `403 CANNOT_BID_OWN_AUCTION`

---

### PATCH /api/auctions/:id
**Auth:** Admin only

**Request:** `{ "status": "cancelled" }` or other admin-adjustable fields

**Response 200:** `{ "success": true, "data": { ...auction } }`

---

## 4. WALLET

### GET /api/wallet
**Auth:** Required

**Response 200:**
```json
{
  "success": true,
  "data": {
    "balance": 500000.00,
    "held_amount": 38100.00,
    "available_balance": 461900.00,
    "recent_transactions": [ ...last 5 ]
  }
}
```

---

### POST /api/wallet/fund
**Auth:** Required

**Request:**
```json
{ "amount": 100000 }
```

**Validation:** min ₦5,000, max ₦10,000,000

**Response 200:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "AC_abc123def456"
  }
}
```
Frontend redirects user to `authorization_url`.

---

### POST /api/wallet/fund/manual
**Auth:** Required

**Request:**
```json
{
  "amount": 100000,
  "bank_name": "Providus Bank",
  "account_number": "13084122881"
}
```

**Logic:**
1. Create a `processing` transaction.
2. Store bank details as proof of intent.

**Response 200:**
```json
{
  "success": true,
  "message": "Payment notification received. Awaiting admin verification."
}
```

---

### POST /api/wallet/admin/approve/:id
**Auth:** Admin only
**Purpose:** Approve a manual funding request.

**Response 200:**
```json
{
  "success": true,
  "message": "Transaction approved and wallet credited."
}
```

---

### POST /api/wallet/admin/decline/:id
**Auth:** Admin only
**Purpose:** Decline a manual funding request.

**Response 200:**
```json
{
  "success": true,
  "message": "Transaction declined."
}
```

---

### POST /api/wallet/webhook
**Auth:** Paystack signature verification (NOT JWT)

**Headers:** `x-paystack-signature: <hmac-sha512>`

**Request body:** Paystack event object

**Logic:**
1. Verify HMAC signature
2. Check event type = `charge.success`
3. Look up transaction by `reference` — if already exists, return 200 (idempotent)
4. Credit user wallet (atomic update)
5. Create transaction record (type=`funding`, status=`completed`)

**Response 200:** `{ "success": true }`

---

### GET /api/wallet/transactions
**Auth:** Required

**Query params:** `page`, `limit`, `type`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "funding",
      "amount": 100000.00,
      "balance_after": 500000.00,
      "status": "processing",
      "description": "Manual Bank Transfer (Providus Bank)",
      "reference_type": null,
      "reference_id": null,
      "created_at": "..."
    }
  ],
  "pagination": { ... }
}
```

---

## 5. AI VALUATION

### POST /api/valuations
**Auth:** None | **Rate Limit:** 5/hr per email

**Request:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "condition": "clean",
  "mileage_km": 24000,
  "email": "dapo@example.com"
}
```

**Logic:**
1. Check `valuations` table for matching `make+model+year+condition` created within 24h
2. If cached → return cached result (no Groq call)
3. If not cached → call Groq API with structured prompt
4. Validate response against Zod schema
5. Store result in `valuations` table
6. Return result

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "result": {
      "price_tokunbo": 14500000,
      "price_nigerian_used": 17200000,
      "price_brand_new": 24000000,
      "clearing_cost_estimate": 3200000,
      "investment_score": 7,
      "recommendation": "Buy",
      "market_trend": "Rising demand due to fuel efficiency",
      "confidence_level": "High"
    },
    "cached": false,
    "created_at": "..."
  }
}
```

**Errors:** `503 AI_SERVICE_UNAVAILABLE` (with `retry_after: 60`), `429 RATE_LIMIT_EXCEEDED`

---

## 6. USER (ME)

### GET /api/me
**Auth:** Required

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "dapo@example.com",
    "display_name": "Dapo Adeleke",
    "phone": "+2348012345678",
    "role": "user",
    "avatar_url": "https://...",
    "wallet_balance": 461900.00,
    "email_verified": true,
    "kyc_status": "none",
    "is_active": true,
    "last_login_at": "..."
  }
}
```

---

### PATCH /api/me
**Auth:** Required | Partial update

**Request:** Any of: `display_name`, `phone`, `avatar_url`

**Response 200:** `{ "success": true, "data": { ...updated_user } }`

---

### GET /api/me/garage
**Auth:** Required

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "images": ["url1"],
      "trust_score": 85,
      "purchase_price": 19050000,
      "catalog_market_value": 17200000,
      "acquired_at": "..."
    }
  ]
}
```

---

### GET /api/me/bids
**Auth:** Required

**Query params:** `status` (active, won, lost)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 19050000,
      "is_winning": true,
      "created_at": "...",
      "auction": {
        "id": "uuid",
        "status": "live",
        "current_price": 19050000,
        "end_time": "...",
        "vehicle": { "make": "Toyota", "model": "Camry", "year": 2022, "images": ["url1"] }
      }
    }
  ]
}
```

---

### POST /api/me/kyc
**Auth:** Required

**Request:** `multipart/form-data` with fields:
- `government_id` (file, Cloudinary upload)
- `selfie` (file, Cloudinary upload)

**Response 200:** `{ "success": true, "message": "KYC submitted. Under review within 48 hours." }`
**Side effect:** `users.kyc_status` → `pending`

---

## 7. ADMIN

### GET /api/admin/dashboard
**Auth:** Admin only

**Query params:** `period` (7d, 30d, 90d)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 4250000.00,
    "active_auctions": 3,
    "total_users": 142,
    "pending_settlements": 2,
    "recent_settlements": [ ... ],
    "revenue_by_day": [
      { "date": "2026-02-19", "amount": 850000 }
    ]
  }
}
```

---

### GET /api/admin/users
**Auth:** Admin | **Query:** `page`, `limit`, `search`, `role`, `kyc_status`

**Response:** Paginated list of user objects (no `password_hash`).

---

### PATCH /api/admin/users/:id
**Auth:** Admin

**Request:** `{ "is_active": false }` or `{ "role": "admin" }` or `{ "wallet_adjustment": 50000, "reason": "Demo fund" }`

**Response 200:** Updated user object.
**Side effect:** Logged to `admin_audit_log`.

---

### PATCH /api/admin/users/:id/kyc
**Auth:** Admin

**Request:** `{ "kyc_status": "verified" }` or `{ "kyc_status": "rejected", "reason": "ID unclear" }`

**Response 200:** Updated user.
**Side effect:** Logged to `admin_audit_log`. Email sent to user.

---

### GET /api/admin/audit
**Auth:** Admin | **Query:** `page`, `limit`, `admin_id`, `action`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "admin_id": "uuid",
      "admin_name": "Admin User",
      "action": "kyc_approved",
      "target_type": "user",
      "target_id": "uuid",
      "old_value": { "kyc_status": "pending" },
      "new_value": { "kyc_status": "verified" },
      "reason": null,
      "ip_address": "197.210.x.x",
      "created_at": "..."
    }
  ],
  "pagination": { ... }
}
```

---

## SOCKET.IO EVENTS

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_auction` | `{ auction_id: "uuid" }` | Join auction room |
| `leave_auction` | `{ auction_id: "uuid" }` | Leave auction room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_bid` | `{ bidder_display_name, amount, bid_count, time_remaining, is_sniped }` | New bid placed |
| `auction_ending` | `{ time_remaining: 120 }` | <2 min warning |
| `auction_ended` | `{ winner_display_name, final_price, was_reserve_met }` | Auction conclusion |
| `bid_error` | `{ code, message }` | Bid validation failure to sender |
| `price_update` | `{ current_price, bid_count }` | Redundant price update for reconnecting clients |

### Reconnection Strategy (Client)
1. Socket.IO auto-reconnect with exponential backoff
2. On reconnect: call `GET /api/auctions/:id` via REST to get latest state
3. Max 3 retries, then show "Reconnect" button
4. Show toast: "Connection lost. Reconnecting..." during retry
