# GenZ Investing Concept (MERN)

A case-study prototype for Groww's product intern round. Not an official Groww product. All market data is mock and illustrative.

**Two features, one insight:** Gen Z spends on brands they love, with people they love, but investing feels abstract and solo.

- **Own What You Love**: mock UPI spends show which brands you already pay ("₹2,340 on Zomato this month"). Pick up to 5 and build a basket from ₹100, paired by default with a 50% Nifty 50 safety core.
- **Squads**: shared goal pots (trip, flat deposit) with friends. The timeline picks the fund (≤12 months → liquid, ≤36 → short debt, longer → index), so short-term money never sits in stocks. Each member owns their own units.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite (`client/`) |
| API | Node + Express (`server/src/routes.js`) |
| Database | MongoDB via Mongoose (`server/src/models.js`) |

Auth, real KYC, payments and live spend tracking are out of scope. Every request acts as one seeded demo user.

## Run locally

Requires Node 18+. No MongoDB install is needed: without `MONGODB_URI` the server starts an in-memory MongoDB that resets on restart.

```bash
npm run install:all
npm run dev          # API on :5000, app on http://localhost:5173
```

To use a real database, copy `server/.env.example` to `server/.env` and set `MONGODB_URI`.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/me` | Demo user, mock spends, contacts |
| GET | `/api/brands`, `/api/brands/:slug` | Brand catalogue |
| GET | `/api/funds/recommend?months=6` | Fund chosen for a goal timeline |
| GET / POST | `/api/basket` | Read / create the Love Basket (1–5 brands, ≥ ₹100) |
| GET / POST | `/api/squads` | List / create squads |
| GET | `/api/squads/:id` | Squad detail with progress and fund |
| POST | `/api/squads/:id/contributions` | Add money (≥ ₹100) |
| POST | `/api/squads/:id/nudge` | Nudge the lowest contributor |
| GET | `/api/portfolio` | Combined holdings |
| POST | `/api/demo/reset` | Restore demo data |

## Deploy (free tier: Vercel + MongoDB Atlas)

Vercel serves the React build as static files and runs the Express API as one serverless function (`api/index.js`). `vercel.json` holds the build settings, so nothing needs configuring by hand.

**1. MongoDB Atlas**
1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. Database Access: add a user with a password (avoid `@`, `/`, `:` in it).
3. Network Access: allow `0.0.0.0/0`. Vercel has no fixed IP addresses.
4. Connect → Drivers: copy the connection string and add a database name before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/genz-invest?retryWrites=true&w=majority`

**2. GitHub**: push the `genz-invest` folder to a new repo (`.gitignore` already skips `node_modules` and `.env`).

**3. Vercel**
1. vercel.com → Add New → Project → import the repo. If `genz-invest` is a subfolder of the repo, set it as the **Root Directory**.
2. Environment Variables: `MONGODB_URI` = your Atlas string.
3. Deploy. The first API call seeds the demo data automatically.
4. Open the URL in an incognito window and check `/api/health` returns `{"ok":true}`.

If screens show "Couldn't load this", open Vercel → the project → Logs. "Database not configured" means `MONGODB_URI` is missing. A timeout usually means the Atlas network access step was skipped.
