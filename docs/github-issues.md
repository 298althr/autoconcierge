# GitHub Issues to Create
> Once you log into GitHub (https://github.com/298althr/autoconcierge), create these labels and issues.
> Or share a Personal Access Token and I can create them programmatically.

---

## STEP 1: Create Labels First

Go to: https://github.com/298althr/autoconcierge/labels

Create these labels:

| Label Name | Color | Description |
|-----------|-------|-------------|
| `feature` | `#0075ca` | New functionality |
| `bug` | `#d73a4a` | Something is broken |
| `refactor` | `#e4e669` | Code improvement without behavior change |
| `infra` | `#0052cc` | Docker, CI/CD, deployment, database |
| `design` | `#b60dbd` | UI/UX decisions and implementation |
| `discussion` | `#ffffff` | Needs decision before implementation |
| `blocked` | `#e99695` | Waiting on external dependency |
| `phase-0` | `#f9d0c4` | Foundation & Docker |
| `phase-1` | `#fef2c0` | Authentication |
| `phase-2` | `#c2e0c6` | Vehicle Catalog |
| `phase-3` | `#bfd4f2` | AI Valuation |
| `phase-4` | `#d4c5f9` | Wallet & Payments |
| `phase-5` | `#e6edf3` | Auction Engine |
| `phase-6` | `#f0fff4` | Settlement & User Dashboard |
| `phase-7` | `#fff5b1` | Admin Panel |
| `phase-8` | `#f8f8f8` | Polish & Hardening |
| `phase-9` | `#1f6feb` | Deployment |

---

## STEP 2: Create Issues

### PHASE 0 — FOUNDATION

**Issue #1: Docker Development Environment**
- Labels: `infra`, `phase-0`
- Body:
```
## Goal
Set up a complete local development environment using Docker Compose.

## Files to Create
- `docker-compose.yml` — PostgreSQL 16 + Express server + Next.js client
- `server/Dockerfile.dev` — nodemon hot-reload
- `client/Dockerfile.dev` — Next.js hot-reload
- `server/.env` from `.env.example`

## Acceptance Criteria
- [ ] `docker-compose up` starts all 3 services without errors
- [ ] `http://localhost:3001` shows a working Next.js page
- [ ] `http://localhost:4000/health` returns `{ "status": "ok" }`
- [ ] PostgreSQL accessible at `localhost:5432`
- [ ] Logs show all services healthy

## AI Decision Log
See: docs/ai-logs.md (2026-02-19 session)
See: docs/deployment.md for Docker instructions
```

---

**Issue #2: Project Scaffolding — Server + Client**
- Labels: `infra`, `phase-0`
- Body:
```
## Goal
Initialize the monorepo structure. One command starts everything.

## Files to Create
- Root `package.json` with concurrently scripts
- `server/` — Express.js 4, nodemon
- `client/` — Next.js 14, TypeScript, Tailwind CSS
- `client/src/styles/globals.css` — Design tokens from UI standard
- `client/tailwind.config.ts` — Extended with design tokens

## Design Tokens (from ui-standard.html)
- Primary: `#800020` (Burgundy)
- Surface: `#1A1A1A` (Onyx)
- Background: `#F8FAFC` (Canvas)
- Success: `#10B981` (Emerald)
- Display font: Montserrat
- Body font: Inter

## Acceptance Criteria
- [ ] `npm run dev` starts both server and client simultaneously
- [ ] Design tokens available as CSS variables AND Tailwind classes
- [ ] TypeScript configured in client
- [ ] ESLint configured

## Docs
- Folder structure: docs/architecture.md
- Design system: ui standard.html
```

---

**Issue #3: Database Migrations — All 7 Tables**
- Labels: `infra`, `phase-0`
- Body:
```
## Goal
Create all 7 MVP database tables with correct indexes.

## Tables to Create
1. `users` — auth + wallet + role
2. `vehicle_catalog` — reference data (pre-seeded)
3. `vehicles` — physical inventory
4. `auctions` — 1:1 with vehicle
5. `bids` — immutable bid log
6. `transactions` — financial ledger
7. `admin_audit_log` — admin action log

## Files
- `server/db/migrations/001_users.sql` through `007_admin_audit_log.sql`
- `server/db/migrate.js` — runs all in order

## Acceptance Criteria
- [ ] `npm run migrate` runs without errors
- [ ] All 7 tables exist: `SELECT tablename FROM pg_tables WHERE schemaname='public'`
- [ ] All indexes created
- [ ] All constraints enforced

## Schema Reference
docs/architecture.md → Database Schema section
```

---

**Issue #4: Vehicle Catalog Seed**
- Labels: `infra`, `phase-0`
- Body:
```
## Goal
Populate `vehicle_catalog` with 500+ Nigeria-relevant vehicle records.

## Source
Open source: ilyasozkurt/automobile-models-and-specs
Supplement with Nigerian market pricing data

## Files
- `server/db/seeds/catalog_seed.js` — transform + insert
- `server/db/seeds/demo_seed.js` — admin user + 5 test vehicles

## Acceptance Criteria
- [ ] `npm run seed` completes without errors
- [ ] `SELECT COUNT(*) FROM vehicle_catalog` returns ≥ 500
- [ ] Admin user created: admin@autoconcierge.ng / password: Admin123
- [ ] 5 test vehicles created with images, trust scores, prices
- [ ] Re-running seed does not create duplicates (idempotent)
```

---

**Issue #5: Authentication Backend**
- Labels: `feature`, `phase-1`
- Body:
```
## Goal
Full authentication API: register, login, refresh, logout, forgot/reset password, email verification.

## Files
- `server/middleware/auth.js` — JWT verify
- `server/middleware/roles.js` — RBAC
- `server/middleware/validate.js` — Zod runner
- `server/middleware/rateLimiter.js`
- `server/services/authService.js`
- `server/services/emailService.js` — SendGrid
- `server/routes/auth.js`

## Security Rules
- JWT access token: 15min expiry
- Refresh token: 7d, httpOnly cookie
- Login: max 5 attempts / 15min per IP
- Account lock after 10 failed logins
- Password: min 8 chars, 1 uppercase, 1 number
- Passwords hashed with bcrypt (12 rounds)

## Blocked By
- Needs: SendGrid API key

## API Contracts
docs/api.md → Section 1: Authentication

## Acceptance Criteria
- [ ] POST /api/auth/register → 201 + verification email sent
- [ ] POST /api/auth/login → 200 + access_token + refresh cookie
- [ ] POST /api/auth/refresh → 200 + new access_token
- [ ] POST /api/auth/logout → 200 + cookie cleared
- [ ] Rate limit → 429 after 5 attempts
- [ ] Wrong password → 401 with generic message
```

---

**Issue #6: Authentication Frontend**
- Labels: `feature`, `design`, `phase-1`
- Body:
```
## Goal
Login and Register pages + auth context + protected routes.

## Files
- `client/src/lib/auth.ts` — AuthContext
- `client/src/lib/api.ts` — fetch wrapper + JWT auto-refresh
- `client/src/app/login/page.tsx`
- `client/src/app/register/page.tsx`
- `client/src/components/layout/Navbar.tsx`
- `client/src/middleware.ts` — Next.js route protection

## Design Reference
UI standard: ui standard.html
Colors: Burgundy #800020, Onyx #1A1A1A
Fonts: Montserrat (headings), Inter (body)

## Acceptance Criteria
- [ ] User can register with email + password
- [ ] Email verification flow works
- [ ] Login stores access_token in memory
- [ ] Refresh token auto-refreshes access_token
- [ ] Protected pages redirect to /login
- [ ] Navbar shows user avatar + wallet balance when logged in
```

---

### Continue creating issues for phases 2-9 following the same pattern.
### See docs/tasks.md for the complete task list.

---

## How to Create Issues via GitHub CLI (Once Logged In)

```bash
# Install GitHub CLI
# https://cli.github.com/

# Authenticate
gh auth login

# Create a label
gh label create "feature" --color "0075ca" --description "New functionality" --repo 298althr/autoconcierge

# Create an issue
gh issue create \
  --title "[Phase 0] Docker Development Environment" \
  --body-file docs/github-issues.md \
  --label "infra,phase-0" \
  --repo 298althr/autoconcierge
```

## Note on GitHub Access
To allow AI to create issues programmatically:
1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token (Classic)
3. Scopes needed: `repo`
4. Share the token and I'll create all issues in one run.
