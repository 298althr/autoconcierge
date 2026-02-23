# AutoConcierge — Tech Stack
> Last updated: 2026-02-19 | Status: Locked for MVP

---

## Confirmed Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend** | Next.js (App Router) | 14.x | SSR for SEO on vehicle pages, RSC for performance |
| **Frontend Language** | TypeScript | 5.x | Type safety, better handoff, IDE support |
| **Styling** | Tailwind CSS | 3.x | Rapid iteration, animation utilities, design token extension |
| **Design System** | CSS Custom Properties + Tailwind config | — | Colors, fonts, spacing managed in globals.css → extended into Tailwind |
| **Backend** | Express.js | 4.x | Proven, simple, fast. Team knows it. |
| **Backend Language** | JavaScript (Node.js) | Node 20 LTS | Fast development. TypeScript post-MVP if needed. |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSONB, row-level locking for bids |
| **Real-time** | Socket.IO | 4.x | WebSocket + HTTP long-polling fallback |
| **Payments** | Paystack | API v2 | Nigerian market leader. 1.5% fee. Well-documented. |
| **AI/LLM** | Groq SDK (Llama 3.1 70B) | Latest | ~500ms inference, generous free tier, JSON mode |
| **Schema Validation** | Zod | 3.x | API input validation + Groq output schema enforcement |
| **Image Storage** | Cloudinary | Latest | Auto-optimization, transformation URLs, 25GB free tier |
| **Email** | SendGrid | v3 | Transactional emails, 100/day free tier |
| **Hosting** | Render.com | — | Auto-deploy from GitHub, managed PostgreSQL, free SSL |
| **Dev Environment** | Docker + Docker Compose | Latest | PostgreSQL + backend + frontend all containerized locally |
| **Package Manager** | npm | Latest | Default with Node |
| **Process Manager** | nodemon (dev) | Latest | Hot reload for backend |
| **HTTP Client (backend)** | axios | Latest | Paystack/Groq API calls |
| **Auth** | bcrypt + JWT (jsonwebtoken) | Latest | Custom auth. No third-party auth vendors. |
| **Rate Limiting** | express-rate-limit | Latest | Per-IP + per-user limits |
| **Security Headers** | helmet | Latest | XSS, CSP, HSTS headers |
| **CORS** | cors | Latest | Whitelist-only origins |
| **Cron Jobs** | node-cron | Latest | Auction status transitions, settlement timeout |
| **Logging** | morgan (HTTP) | Latest | Request logging |
| **Testing (Backend)** | Jest + Supertest | Latest | API endpoint testing |
| **Testing (Frontend)** | Jest + React Testing Library | Latest | Component testing |
| **Fonts** | Google Fonts (Montserrat + Inter) | — | Matches UI standard |
| **Charts (Admin)** | Chart.js | 3.x | Revenue metrics, admin dashboard |
| **Version Control** | Git + GitHub | — | Repo: github.com/298althr/autoconcierge |

---

## What Is NOT Used (And Why)

| Technology | Why Not |
|-----------|---------|
| **Python** | Not needed. Node.js Groq SDK handles all AI calls. Stack stays unified JS/TS. |
| **Redis** | PostgreSQL handles MVP load. Redis added in Phase 2 (>1,000 concurrent users). |
| **MongoDB** | JSONB columns handle flexible data. One DB = simpler ops + ACID guarantees. |
| **GraphQL** | REST is simpler, faster to implement, sufficient for MVP data needs. |
| **Firebase Auth** | Need control over auth flow, JWT customization, no vendor lock-in. |
| **AWS S3** | Cloudinary provides S3-level storage + image optimization in one service. |
| **Docker in production** | Render.com handles containerization. Docker only for local dev. |
| **Microservices** | Monolith first. Split when proven scale problems exist. |
| **Kubernetes** | Way overkill. Render handles scaling. Evaluate at 10,000+ users. |
| **Pgvector** | No embeddings in MVP. Standard SQL search sufficient for <10K vehicles. |
| **N8N workflows** | Direct function calls in services/. No workflow orchestration needed for MVP. |
| **React Native** | Web-first. Mobile PWA covers initial mobile users. Native app Phase 3. |

---

## Monorepo Structure

```
AutoConcierge/
├── client/               # Next.js 14 frontend (TypeScript)
├── server/               # Express.js backend (JavaScript)
├── docs/                 # All documentation
├── docker-compose.yml    # Local development environment
├── .env.example          # All required environment variables
├── .gitignore
├── package.json          # Root scripts
└── README.md
```

---

## Environment Variables (All Required)

See `/docs/deployment.md` for full list with descriptions.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` — 64-char random string
- `JWT_REFRESH_SECRET` — 64-char random string
- `PAYSTACK_SECRET_KEY` — from Paystack dashboard
- `PAYSTACK_WEBHOOK_SECRET` — from Paystack dashboard
- `GROQ_API_KEY` — from console.groq.com
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SENDGRID_API_KEY`

---

## CI/CD Plan (MVP)

1. **Local dev:** Docker Compose (PostgreSQL + server + client)
2. **Deploy:** Push to `main` → Render auto-deploys
3. **Migrations:** Run automatically on deploy via `npm run migrate`
4. **Seed:** Manual run via `npm run seed` (done once on first deploy)
5. **Post-MVP:** GitHub Actions for CI (lint + test on every PR)
