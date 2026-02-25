# Autogaard — Project Handover Document
============================================================
**Date:** February 23, 2026
**Current Status:** Session 10 - BRAND TRANSITION & OAUTH INTEGRATION COMPLETE.
**Branding:** "Autogaard" (Security-first Automotive Exchange).
**Progress Score:** 100 / 100 (Core MVP + Identity)

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

The platform is built on a **Premium Minimalist Light-Mode** aesthetic under the **Autogaard** brand.

- **Typography Pairing**:
  - **Headings**: `Plus Jakarta Sans` (Extrabold)
  - **Subheadings/Cards**: `Outfit`
  - **Body**: `Inter`
- **Branding**: Official logos integrated in `client/public/logo.png` (Brand) and `client/public/logo.svg` (Vector Icon).
- **Theme**: Deep Burgundy (`#800000`) accents on White/Glass backgrounds.
- **Header**: Floating glassmorphic **PillHeader** (Dock). Logo size scaled to standard premium height (`h-10` / `40px`).
- **Auth Experience**: Light-mode, airy backgrounds (Porsche 911 studio shot) with glassmorphic cards and backdrop blurs.
- **Vibe**: Product-centric automotive authority. No clutter. Smooth Framer Motion transitions.

## 🐳 Docker Desktop Environment

The local development environment is now fully containerized under the Docker project name **`autogaard`**.

- **Project Consolidation:** All previous "autoconcierge" containers have been purged.
- **Services:**
  - `Autogaard-client`: Next.js (Port 3001)
  - `Autogaard-server`: Node/Express (Port 4000)
  - `Autogaard-postgres`: PostgreSQL (Port 5432)
- **Networking:** Services communicate over the internal `autogaard_default` network.
- **Migrations:** Database migrations run automatically on server start via `db/migrate.js`.

## 🛰️ Google OAuth & Security

- **Status:** Handshake Verified.
- **Config:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured in `server/.env`.
- **Flow:** Uses the modern Google Identity popup method. Redirects are handled via `postmessage` for a seamless SPA experience.
- **Success:** Google API endpoints verified reachable and responsive.

## 🎯 What Was Just Finished?

1. **Brand Identity Migration (Session 10):**
   - Transferred entire ecosystem from "AutoConcierge" to **Autogaard**.
   - Integrated premium vector (`.svg`) and brand (`.png`) assets.
   - Deployed light-mode, high-fidelity auth backgrounds with glassmorphic UI.
   - Rescaled brand presence across all headers and entry points.

2. **Google OAuth Production Finalization (Session 11):**
   - Wired the frontend `Sign in with Google` verified token to the backend `/auth/google` route.
   - Fixed specific Next.js `.env` build hydration issues inside Docker on Railway to ensure the button renders securely in production.
   - Authorized correct origins in Google Cloud Console.

3. **Data Infrastructure (Session 11):**
   - Seeded the `automobile_specs` database with over 30,000 real-world engine specs.
   - Created specialized web scrapers for Nigerian vs Foreign used car market valuations.

## 🚀 THE TODO: PHASE 12+ VALIDATION & DASHBOARDS (New Strategy)

- [ ] **12: Client Dashboard Scaffold**: Redesign the generic `/profile` into a comprehensive Dashboard portal bridging the Wallet, Active Bids, Garage, and Settings into a unified React layout.
- [ ] **13: Valuation Interactive Wizard**: Transition the AI valuation tool from free-text inputs into structured dropdowns powered by the ingested `automobile_specs` database (Make -> Model -> Year).
- [ ] **14: KYC Deferral Logic**: Ensure new signups are dumped seamlessly into the Dashboard without hard requirements to upload passport data. Secure the platform by setting a cumulative `₦500k` transaction trigger that forces KYC prior to withdrawal or excessive bidding.
- [ ] **15: Wallet & Escrow Validation**: Perform end-to-end testing of the 5% margin deduction and anti-snipe bidding protocols inside socket.io.

