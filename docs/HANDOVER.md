# AutoConcierge — Project Handover Document
============================================================
**Date:** February 22, 2026
**Current Status:** Phase 8 (Polish) Completed. Local dev environment stabilized (Docker bugs fixed). Next up is Phase 9 (Deploy).
**Progress Score:** 95 / 100

Welcome back or welcome to the team! This document serves as your entry point for resuming development. It answers the "where are we?" and "what's next?" questions so you can hit the ground running.

## 🧠 Memory & Context Management

The most critical part of working on this repository is maintaining continuity. We do not wing it—we follow the plan.

1. **`docs/MEMORY.md`**: This is your single source of truth. **You must read this file at the start of every session.** It contains:
   - The current Progress Score.
   - The exact phase and state of the current workflow.
   - Non-negotiable business rules (e.g., wallet handling, escrow logic, KYC).
   - Core API keys and environmental requirements.
   - **Important:** YOU MUST update `MEMORY.md` after every completed slice or major PR.

2. **`docs/tasks.md`**: This tracks the granular tickets for each phase. Check what is `🟢` (completed), `🟡` (in progress), and `🔴` (not started/blocked). When taking on a task, update its status here first.

3. **`docs/AI-DEVELOPMENT-BLUEPRINT.md`** and **`docs/SYSTEM-ARCHITECTURE-AND-WORKFLOWS.md`**: If you are using an AI coding assistant, direct the agent to read these files. They define the boundaries, expected file structures, and strict architectural rules (e.g., No GraphQL, No Redis for the prototype, use PostgreSQL transactions extensively).

## 📚 Essential Documentation

Before writing any code, familiarize yourself with these core reference files tracked in `/docs`:

- **`requirements.md`** & **`pages.md`**: Product scope and what exactly needs to render on the front end.
- **`architecture.md`**: The complete breakdown of the Node.js/Express server and the PostgreSQL singleton structure (including the 7 core tables).
- **`api.md`**: The contract for all Express REST routes.
- **`deployment.md`**: The playbook for getting this local environment mapped properly to Docker and eventually Railway.app.

## 🎨 Design & Typography Requirement (CRITICAL)

The current iteration of the landing page has been refactored to a "Figma-esque" dark mode, but the USER has noted a requirement for a **complete high-end designer overhaul**. 

**Next Steps for the Designer/Engineer:**
- **Typography Pairing**: We have implemented a core pairing:
  - **Headings**: `Plus Jakarta Sans` (Extrabold)
  - **Subheadings/Cards**: `Outfit`
  - **Body**: `Inter`
- **Critique**: The header bar (Navbar) was noted for visibility issues. Ensure the glassmorphism and contrasting text handle every scroll state perfectly.
- **Vibe**: Avoid "2010" era web design. Stick to deep dark mode surfaces (`#050505`), blurred gradient orbs, and high-end whitespace/tracking.

## 🐳 Docker vs. Host Development

You will find a high-quality `docker-compose.yml` and `Dockerfile.dev` in both the server and client. 

**Note on Development:**
- For standard development, we've been using **host-based `npm run dev`** on Windows to bypass common filesystem performance bottlenecks and encoding issues with log-level visibility.
- **Docker is configured and ready** for consistent environment replication and production-grade local testing. Use `docker-compose up` to spin up the full 3-tier stack (Postgres + Node + Next.js).

## 🎯 What Was Just Finished?

We just completed a major **Local Stability & Bug Fix Session**:
- **Docker Build Stability:** Fixed silent `npm install` failures in `Dockerfile.dev` by enforcing `--legacy-peer-deps`, which resolved a critical crash loop caused by missing `@sendgrid/mail`. 
- **Networking & IPv6 Issues:** Swapped `localhost` for `127.0.0.1` and `0.0.0.0` bindings across `docker-compose.yml`, `server/index.js`, and `.env.local` to completely bypass Node 17+ IPv6 DNS resolution bugs on Windows.
- **Login Crash Fixed:** Resolved a `500 Internal Server Error` during login caused by a database schema mismatch (`password_hash` vs. `password`) that was passing `undefined` into `bcrypt.compare()`.
- **Frontend Auth Context:** Fixed a destructuring bug in `AuthContext.tsx` where the frontend expected `response.data.user` instead of `response.user`, causing red UI error walls upon successful login.
- **Concurrency Testing:** Ran an `autocannon` 100-user concurrency test. Discovered the system correctly throttles at ~1,500 req/sec via `express-rate-limit` (returning `429 Too Many Requests`). Concluded that true 10,000 CCU load testing must be performed on a production Kubernetes/Docker-Swarm cluster, not local Docker desktop which chokes on TCP exhaustion and Next.js dev compilation overhead.

## 🚀 The Todo: Proceeding to Phase 9 (Deploy)

Your immediate mission is **Phase 9: Deployment**. 

Here are the exact tasks waiting in `docs/tasks.md`:

- [ ] **9A: Deploy PostgreSQL on Railway** (Obtain the connection string and apply migrations dynamically).
- [ ] **9B: Deploy the Node/Express Backend** (Set up Docker deployment or Railway Node.js environment; wire up ENV variables).
- [ ] **9C: Deploy Next.js Frontend** (Connect it securely to the live backend API).
- [ ] **9D: Seed the DB against production** (Push demo user, vehicles, and active auctions to show investors/testers).
- [ ] **9F: Final UI Smoke Test** (Create an account, fund the wallet, place a live bid, let the auction run out, and execute settlement—all on the live URL).

## 🧩 Phase 10: Open Source Core Integrations (Post-MVP)
As noted in `repo.md` and the `MVP-PROTOTYPE-RECOMMENDATION.md` file, there are specific external open source modules designated for integration once the core logic is deployed:
- [ ] **10A: Vehicle Catalog Injection**: Integrate the SQL dump from `ilyasozkurt/automobile-models-and-specs` directly into our PostgreSQL `vehicle_catalog` table (delivering 30,000+ engine specs).
- [ ] **10B: KYC Systems Integration**: Merge in the KYC documentation logic using patterns from the `Twilio-KYC Next.js App` repo, specifically wiring it for Termii OTPs and Smile ID.
- [ ] **10C: Advanced Live Bidding (Optional Scale)**: Using lessons from `dineshkn-dev/live-bidding`, prep the system’s transition from strict Socket.IO to Redis/RabbitMQ when socket latency scales beyond prototype capacities.
