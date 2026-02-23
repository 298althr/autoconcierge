# AutoConcierge — AI Session Logs
> Format: Date | Feature | Summary of decisions made

---

## 2026-02-18 | Session 1 — Blueprint Creation

**Prompt summary:** Define the product scope, feature list, architecture, DB schema, API routes, environment variables.

**Key decisions made:**
- Product name confirmed as "AutoConcierge"
- 7 MVP tables defined (users, vehicle_catalog, vehicles, auctions, bids, transactions, admin_audit_log)
- Stack locked: Node.js + Express backend, Next.js 14 frontend, PostgreSQL 16, Socket.IO, Paystack, Groq, Cloudinary, SendGrid
- Redis deferred to Phase 2
- Microservices / GraphQL / Firebase / Docker-in-prod excluded
- JWT access token in memory, refresh token as httpOnly cookie
- `SELECT FOR UPDATE` row locking for concurrent bid handling
- Anti-sniping: bid in last 2min → extend 2min, max 3 extensions
- Commission: 5% fixed on final price
- Bid deposit: 20% held from wallet
- Settlement deadline: 48 hours

---

## 2026-02-19 | Session 2 — Documentation + Process

**Prompt summary:** Establish project management process, confirm tech stack, define all pages and flows, create /docs folder.

**Key decisions made:**
- Concierge page → Phase 2 (not MVP). Will use WhatsApp manually for now.
- Service Hub → Phase 2
- Redis → Phase 2
- Python → NOT needed. Node.js Groq SDK handles all AI (TypeScript/JavaScript unified)
- Docker: local dev only. Render handles production containerization.
- Vertical slice delivery strategy adopted (DB → API → service → UI → tests per feature)
- GitHub repo: https://github.com/298althr/autoconcierge
- UI Standard confirmed: Tailwind CSS + CSS custom properties for design tokens
- Design tokens: Primary #800020 (Burgundy), Surface #1A1A1A (Onyx), BG #FFFFFF/#F8FAFC, Success #10B981
- Fonts: Montserrat (display/headings) + Inter (body)
- WCAG compliance confirmed: contrast ratio 12.6:1 (target: 4.5:1)
- Min touch target: 44×44pt (iOS) / 48×48dp (Android)
- Testing: Jest + Supertest (backend), Jest + React Testing Library (frontend)
- GitHub Issues for task tracking with labels: feature, bug, refactor, infra, design, discussion, blocked

**Documents created this session:**
- `docs/requirements.md` — problem, users, MVP scope, success criteria, business rules
- `docs/stack.md` — tech stack decisions, exclusions, monorepo structure
- `docs/pages.md` — all 15 pages, every flow, modal, empty/error/loading state
- `docs/api.md` — every API endpoint with request/response/validation/errors
- `docs/architecture.md` — system diagram, 7 core systems, complete DB schema, state machines
- `docs/plans.md` — full implementation plan (9 phases, 20 slices)
- `docs/deployment.md` — environment variables, Docker, Render, npm scripts
- `docs/ai-logs.md` — this file

**Open questions from this session:**
1. Need GitHub access token to create issues → provided repo URL: github.com/298althr/autoconcierge
2. Need API keys before starting: Paystack, Groq, Cloudinary, SendGrid, PostgreSQL connection
3. No pending architectural decisions — ready to start Phase 0

**Next action:** Build Slice 0A (Docker) → Slice 0B (Scaffolding) → Slice 0C (Migrations)
