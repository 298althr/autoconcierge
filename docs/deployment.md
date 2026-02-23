# AutoConcierge — Deployment & Environment Variables
> Last updated: 2026-02-19 | Deployment platform: **Railway.app**

---

## Environment Variables

Create a `.env` file in `server/` directory. Never commit it.

```env
# ============================================================
# SERVER
# ============================================================
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# ============================================================
# DATABASE
# ============================================================
DATABASE_URL=postgresql://autoconcierge:password@localhost:5432/autoconcierge
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# ============================================================
# JWT SECRETS (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# ============================================================
JWT_ACCESS_SECRET=<64-char-hex-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=<different-64-char-hex-string>
JWT_REFRESH_EXPIRY=7d

# ============================================================
# PAYSTACK (from https://dashboard.paystack.com/#/settings/developers)
# ============================================================
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=<webhook-secret-from-paystack-dashboard>

# ============================================================
# GROQ (from https://console.groq.com)
# ============================================================
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-70b-versatile

# ============================================================
# CLOUDINARY (from https://cloudinary.com/console)
# ============================================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_UPLOAD_PRESET=autoconcierge_vehicles

# ============================================================
# SENDGRID (from https://app.sendgrid.com/settings/api_keys)
# ============================================================
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@autoconcierge.ng
SENDGRID_FROM_NAME=AutoConcierge

# ============================================================
# PLATFORM CONFIG
# ============================================================
DEFAULT_COMMISSION_RATE=0.05
DEFAULT_BID_INCREMENT=50000
DEFAULT_DEPOSIT_PCT=20
SETTLEMENT_HOURS=48
ANTI_SNIPE_MINUTES=2
MAX_SNIPE_EXTENSIONS=3
```

---

## Docker — Local Development

**Prerequisites:** Docker Desktop installed

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop all services
docker-compose down

# Reset database (DESTRUCTIVE)
docker-compose down -v
docker-compose up
```

**Services running after `docker-compose up`:**
| Service | URL | Description |
|---------|-----|-------------|
| Next.js client | http://localhost:3000 | Frontend |
| Express server | http://localhost:4000 | Backend API |
| PostgreSQL | localhost:5432 | Database |

---

## Database Setup

```bash
# Run migrations (creates all 7 tables)
npm run migrate

# Seed with catalog + demo data
npm run seed

# Connect to database directly
docker exec -it autoconcierge-postgres psql -U autoconcierge -d autoconcierge
```

---

## Railway.app Production Deployment

### Services to Create in Railway Dashboard (railway.app):

1. **PostgreSQL** (Railway Plugin)
   - Add via: New Project → Add Plugin → PostgreSQL
   - Railway generates `DATABASE_URL` automatically
   - Copy the internal connection string

2. **Backend Web Service**
   - Connect GitHub repo: `298althr/autoconcierge`
   - Root Directory: `server/`
   - Start Command: `npm start`
   - Add all environment variables from `.env.example`

3. **Frontend Web Service**
   - Connect same GitHub repo
   - Root Directory: `client/`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Set `NEXT_PUBLIC_API_URL` to your backend Railway domain

### Environment Variables in Railway:
Set all variables from `.env.example` in each service's Variables panel.

### Post-Deploy Steps:
```bash
# 1. Open Railway shell for backend service
# Railway Dashboard → backend service → Deploy → Shell
npm run migrate

# 2. Seed data (run ONCE)
npm run seed

# 3. Register Paystack webhook
# URL: https://your-api.up.railway.app/api/wallet/webhook
# Events: charge.success

# 4. Custom Domain (optional)
# Railway Dashboard → service → Settings → Domains → Add Custom Domain
# Add CNAME pointing your domain to Railway-provided URL
```

### Railway Auto-Deploy
Railway auto-deploys whenever you push to the `main` branch on GitHub.
No manual deploy needed after initial setup.

---

## npm Scripts

```json
// Root package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "migrate": "node server/db/migrate.js",
    "seed": "node server/db/seeds/catalog_seed.js && node server/db/seeds/demo_seed.js",
    "test": "npm run test --prefix server && npm run test --prefix client",
    "lint": "npm run lint --prefix client"
  }
}
```

---

## First Run Checklist

- [ ] Docker Desktop installed and running
- [ ] `.env` file created from `.env.example`
- [ ] All API keys filled in `.env`
- [ ] `docker-compose up` succeeds (all 3 services green)
- [ ] `npm run migrate` shows "All migrations completed"
- [ ] `npm run seed` shows "Catalog seeded", "Demo data created"
- [ ] `http://localhost:3000` loads Next.js app
- [ ] `http://localhost:4000/health` returns `{ "status": "ok" }`
- [ ] Database connection confirmed (server logs show "PostgreSQL connected")
- [ ] Can register a new user account
- [ ] Can login and see JWT in response
