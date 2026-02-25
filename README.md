# Autogaard

Nigeria's most transparent, AI-powered used car marketplace. Real-time auctions, AI market valuations, escrow wallet, and zero trust games.

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20 LTS
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/298althr/Autogaard.git
cd Autogaard
```

### 2. Set Up Environment Variables
```bash
cp .env.example server/.env
# Edit server/.env with your actual API keys
```

### 3. Start Development Environment
```bash
docker-compose up
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **Express API** on `http://localhost:4000`
- **Next.js client** on `http://localhost:3000`

### 4. Initialize Database
```bash
npm run migrate   # Create all 7 tables
npm run seed      # Load vehicle catalog + demo data
```

### 5. Verify Setup
- Open `http://localhost:3000` — should see Autogaard landing page
- Open `http://localhost:4000/health` — should return `{ "status": "ok", "db": "connected" }`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Express.js (Node 20 LTS) |
| Database | PostgreSQL 16 |
| Real-time | Socket.IO |
| Payments | Paystack |
| AI | Groq (Llama 3.1 70B) |
| Images | Cloudinary |
| Email | SendGrid |
| Hosting | Render.com |

## Project Structure

```
Autogaard/
├── client/         # Next.js 14 frontend (TypeScript)
├── server/         # Express.js backend (JavaScript)
├── docs/           # All documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

## Documentation

All documentation lives in `/docs`:

| File | Content |
|------|---------|
| `requirements.md` | Problem, users, MVP scope, business rules |
| `stack.md` | Tech decisions, exclusions, justifications |
| `pages.md` | All 15 pages, flows, modals, interactions |
| `api.md` | Every API endpoint with request/response contracts |
| `architecture.md` | System design, DB schema, state machines |
| `plans.md` | Full implementation plan (9 phases) |
| `tasks.md` | Every task with status and dependencies |
| `deployment.md` | Environment variables, Docker, Render deployment |
| `ai-logs.md` | AI session decision log |

## Available Scripts

```bash
# Start everything (development)
npm run dev

# Database
npm run migrate         # Run all migrations
npm run seed            # Load all seed data

# Testing
npm run test            # Run all tests
npm run test:backend    # Backend only
npm run test:frontend   # Frontend only

# Production build
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `server/.env`. Required keys:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET` — generate randomly
- `PAYSTACK_SECRET_KEY` — from Paystack dashboard
- `GROQ_API_KEY` — from console.groq.com
- `CLOUDINARY_*` — from Cloudinary console
- `SENDGRID_API_KEY` — from SendGrid

See `docs/deployment.md` for full instructions.

## Contributing / Handover

This project uses **GitHub Issues** for task tracking. Before starting any work:
1. Check Issues for existing tasks
2. Read `/docs/tasks.md` for the current status
3. Check `/docs/plans.md` for the implementation sequence
4. Review `/docs/ai-logs.md` for architectural decisions

Each Issue references: feature description, linked docs, edge cases, code references.

---

## License

Private. All rights reserved — Autogaard 2026.

