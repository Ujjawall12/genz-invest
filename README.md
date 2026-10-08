<div align="center">

# GenZ Invest

**Own What You Love + Squads: a GenZ-first investing concept for Groww**

[**Live demo**](https://genz-invest.vercel.app) · [Case study](docs/CASE_STUDY.md) · [Case study (PDF)](docs/GenZ-Invest-Case-Study.pdf) · [API health](https://genz-invest.vercel.app/api/health)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

</div>

> **Disclaimer.** This is a case study prototype built for Groww's Product Intern round. It is **not** an official Groww product and is not affiliated with Groww. All prices, returns, spends and transactions are **mock data**. Nothing here is investment advice, and no real money moves.

---

## Contents

1. [The problem](#1-the-problem)
2. [The solution](#2-the-solution)
3. [Two-minute demo script](#3-two-minute-demo-script)
4. [Product rules and guardrails](#4-product-rules-and-guardrails)
5. [Architecture](#5-architecture)
6. [Project structure](#6-project-structure)
7. [Data model](#7-data-model)
8. [API reference](#8-api-reference)
9. [Run it locally](#9-run-it-locally)
10. [Deploy it (Vercel + MongoDB Atlas)](#10-deploy-it-vercel--mongodb-atlas)
11. [Testing and verification](#11-testing-and-verification)
12. [Design decisions and trade-offs](#12-design-decisions-and-trade-offs)
13. [Scope, limitations and roadmap](#13-scope-limitations-and-roadmap)

---

## 1. The problem

A large share of India's new investors are 20 to 26. They're getting their first paycheck, working part-time, or studying. They don't lack money habits. They lack **investing** habits.

A typical 22-year-old intern might spend ₹6,000 a month on Zomato, Zudio and Nykaa, and split a Goa trip four ways on Splitwise, yet hold nothing in a mutual fund. Two barriers explain the gap:

| Barrier | What it looks like |
|---|---|
| **Investing feels abstract** | "NAV", "large-cap" and "expense ratio" mean nothing next to brands they use daily |
| **Investing feels solo** | Almost everything else they do with money, they do with friends |

Account opening is already easy, so access isn't the gap. **Relevance** is.

## 2. The solution

Make investing look like the rest of a GenZ user's financial life: **personal** and **social**.

### Own What You Love (fixes "abstract")

- The app reads the user's (mock) spends and surfaces them as nudges: *"You spent ₹2,340 on Zomato across 9 orders this month. Own a piece from ₹100."*
- Every brand page explains, in one plain sentence each, **what the company does** and **why its price moves**. No ratios.
- Users pick up to **5 brands** and invest from **₹100**, as a monthly SIP or a one-time amount.
- Every basket includes a **Nifty 50 safety core** by default (see [guardrails](#4-product-rules-and-guardrails)).

### Squads (fixes "solo")

- A Squad is a shared goal pot: a trip, a flat deposit, a gift, with friends.
- Everyone invests **their own share from their own account**; the squad is a shared view of progress.
- A progress ring, a per-person monthly target, an activity feed and a "nudge" button add gentle accountability.
- The **goal's timeline picks the fund**, so short-term money never sits in stocks.

## 3. Two-minute demo script

For evaluators: open the [live demo](https://genz-invest.vercel.app) (works best at phone width, or in a desktop browser where it renders inside a phone frame).

| # | Do this | What it shows |
|---|---|---|
| 1 | Look at **Home** | Portfolio summary, spend-based nudges, active squads, a 60-second lesson |
| 2 | Tap the **Zomato** nudge card | Plain-language brand page, your spend, an illustrative chart, a risk warning |
| 3 | Tap **Add to my basket**, go to **Own It**, tick 2 more brands | Selection from spends, capped at 5 |
| 4 | Tap **Build my basket** | SIP vs one-time, ₹100 minimum, live allocation preview |
| 5 | Switch the **Nifty 50 core** off, then back on | The warning that appears is the guardrail in action |
| 6 | **Review → Confirm** | Basket saved to MongoDB; success screen |
| 7 | Open **Squads → Goa Trip** | Progress ring, per-person target, fund choice with the reason, contributions |
| 8 | Tap **Add money**, add ₹1,000 | Contribution saved; ring and feed update |
| 9 | **Squads → New**, drag the timeline slider from 6 to 48 months | The recommended fund changes live: Liquid → Debt → Index |
| 10 | Finish creating the squad | Invite friends, see the equal split per person |
| 11 | Open **Portfolio** | Basket and squad shares combined |

To start over, tap **Reset demo data** at the bottom of the Portfolio tab.

## 4. Product rules and guardrails

The guardrails are the central product decision: **excitement shouldn't manage a first-time investor's money.** All rules are enforced on the server in [`server/src/finance.js`](server/src/finance.js) and [`server/src/routes.js`](server/src/routes.js), not just in the UI.

### Fund by timeline (Squads)

| Goal is… | Fund | Risk | Illustrative return | Why |
|---|---|---|---|---|
| ≤ 12 months away | Liquid Fund | Low | ~6.5% p.a. | Money needed soon must not be exposed to a market fall right before the plan |
| 13–36 months | Short Duration Debt Fund | Low | ~7.2% p.a. | Beats a savings account with low volatility |
| > 36 months | Nifty 50 Index Fund | Medium | ~11.8% p.a. | Long enough to ride out dips |

### Basket allocation (Own What You Love)

```
core on  →  50% Nifty 50 Index Fund  +  50% split equally across chosen brands
core off →  100% split equally across chosen brands (with a visible warning)
```

Example: ₹1,000/month across Zomato, Zudio and Nykaa with the core on gives ₹500 to Nifty 50 and ₹166.67 to each brand.

### Validation limits

| Rule | Limit |
|---|---|
| Brands per basket | 1–5, unique, must exist |
| Basket amount | ₹100 – ₹10,00,000 (whole rupees) |
| Basket mode | `sip` or `once` |
| Squad name | 1–40 characters |
| Squad target | ≥ ₹500 |
| Squad timeline | 1–60 months |
| Squad invitees | 1–10, from the user's contacts |
| Contribution | ₹100 – ₹10,00,000 |

### Ownership

Each squad member owns their **own** units. If someone leaves, their money goes back to them, and nobody can withdraw anyone else's share. This avoids the legal and trust problems of a jointly owned pot.

## 5. Architecture

```mermaid
flowchart LR
    U[User's browser] -->|GET /| CDN[Vercel CDN<br/>React build in client/dist]
    U -->|/api/*| FN[Vercel serverless function<br/>api/index.js → Express app]
    FN -->|Mongoose| DB[(MongoDB Atlas<br/>genz-invest database)]
    subgraph Local development
      V[Vite dev server :5173] -->|proxy /api| E[Express :5000]
      E --> M[(Atlas, or in-memory MongoDB)]
    end
```

**One Express app, two ways to run it.** [`server/src/app.js`](server/src/app.js) builds the app and exports it.

- **Locally**, [`server/src/index.js`](server/src/index.js) calls `app.listen()`. Vite proxies `/api` to it.
- **On Vercel**, [`api/index.js`](api/index.js) exports the same app as a serverless function. [`vercel.json`](vercel.json) rewrites every `/api/*` request to it and serves the React build as static files.

**Request lifecycle**

1. The React client calls `fetch('/api/...')` through [`client/src/api.js`](client/src/api.js).
2. The `ready()` middleware makes sure MongoDB is connected and the demo data exists. Both are cached per process, so a warm serverless function reuses one connection.
3. A user middleware attaches the demo user (auth is out of scope).
4. The route validates the input, applies the product rules, reads or writes MongoDB, and returns a computed view (totals, progress, fund).
5. Errors come back as `{ "error": "message" }` with a proper status code (400, 404, 503).

**Serverless-specific details**

- The connection promise is cached in [`server/src/db.js`](server/src/db.js), so cold starts connect once and warm invocations reuse it.
- If two cold instances race to seed an empty database, the loser's duplicate-key error (`11000`) is ignored.
- Without `MONGODB_URI` in production, the API returns a clear `503 Database not configured` instead of crashing.

## 6. Project structure

```
genz-invest/
├── api/
│   └── index.js            # Vercel serverless entry: exports the Express app
├── client/                 # React 18 + Vite frontend
│   ├── index.html
│   ├── vite.config.js      # dev proxy: /api → localhost:5000
│   └── src/
│       ├── App.jsx         # app shell, stack navigation, global state, toast, bottom sheet
│       ├── AppContext.jsx  # React context + useApp() hook
│       ├── api.js          # typed fetch wrapper for every endpoint
│       ├── lib.js          # formatting (₹, %), allocation preview, useFetch hook
│       ├── styles.css      # design tokens and components (no CSS framework)
│       ├── components/
│       │   └── ui.jsx      # Screen, icons, BrandLogo, Ring, Spark, SquadCard, Loading…
│       └── screens/
│           ├── Home.jsx
│           ├── Brands.jsx         # "Own It" tab
│           ├── BrandDetail.jsx
│           ├── Basket.jsx         # build → review → done
│           ├── Squads.jsx
│           ├── SquadDetail.jsx    # includes the Add money sheet
│           ├── NewSquad.jsx       # 3-step creation with live fund recommendation
│           └── Portfolio.jsx
├── server/                 # Express + Mongoose API
│   ├── .env.example
│   └── src/
│       ├── app.js          # Express app (shared by local + Vercel)
│       ├── index.js        # local server: app.listen()
│       ├── db.js           # cached connection; in-memory MongoDB fallback for dev
│       ├── models.js       # Brand, User, Basket, Squad schemas
│       ├── finance.js      # fund-by-timeline, allocation, illustrative returns
│       ├── routes.js       # all /api routes + validation
│       ├── seedData.js     # demo brands, user, spends, contacts, squads
│       └── seed.js         # `npm run seed`: reset the database
├── vercel.json             # install/build commands, output dir, /api rewrite
└── package.json            # root scripts; API dependencies for Vercel
```

**Frontend notes**

- **Navigation** is a mobile-style stack (`go`, `back`, `setTab`, `reset`) in `App.jsx` instead of URL routing, to mimic native app behaviour inside the phone frame.
- **Global state** (selected brands, basket draft, toast, sheet) lives in one context. Server data is fetched per screen with a small `useFetch` hook that exposes `loading`, `error` and `reload`.
- **Every screen** has loading and error states with a retry button.
- **No UI library.** Design tokens are CSS variables on `:root`, which keeps the bundle around 56 KB gzipped.

## 7. Data model

```mermaid
erDiagram
    USER ||--o| BASKET : owns
    USER ||--o{ SQUAD : owns
    USER {
      string name
      array spends "brand, amount, count, unit"
      array contacts "key, name, color"
    }
    BRAND {
      string slug UK
      string name
      string company
      string ticker
      number price "illustrative"
      number r1y "illustrative 1Y %"
      string risk "Low | Medium | High"
      string about
      string why
    }
    BASKET {
      ObjectId user UK
      array brands "brand slugs, 1-5"
      number amount "min 100"
      string mode "sip | once"
      boolean core
    }
    SQUAD {
      ObjectId owner
      string name
      number target "min 500"
      number months "1-60"
      array members "key, name, color, isMe, amount"
      array feed "text, at"
    }
```

- A **basket** is one per user (unique index on `user`); saving again replaces it (upsert).
- **Squad members** are embedded: a squad is always read whole, and member lists are small (≤ 11).
- **Derived values** (total, progress, per-person monthly target, recommended fund, portfolio value) are computed on read, never stored, so they can't go stale.

## 8. API reference

Base URL: `https://genz-invest.vercel.app/api` (locally `http://localhost:5000/api`). All bodies are JSON. Errors return `{ "error": "..." }`.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check (no database call) |
| GET | `/me` | Demo user, mock spends, contacts |
| GET | `/brands` | All 12 brands |
| GET | `/brands/:slug` | One brand, `404` if unknown |
| GET | `/funds/recommend?months=N` | Fund for a goal `N` months away (1–60) |
| GET | `/basket` | Current basket with allocation, or `null` |
| POST | `/basket` | Create or replace the basket |
| GET | `/squads` | All squads, newest first, with computed fields |
| GET | `/squads/:id` | One squad |
| POST | `/squads` | Create a squad |
| POST | `/squads/:id/contributions` | Add money as the current user |
| POST | `/squads/:id/nudge` | Nudge the lowest contributor |
| GET | `/portfolio` | Basket and squad shares combined |
| POST | `/demo/reset` | Restore the demo data |

<details>
<summary><b>Examples</b></summary>

**Create a basket**

```http
POST /api/basket
{ "brands": ["eternal", "trent", "nykaa"], "amount": 1000, "mode": "sip", "core": true }
```

```json
{
  "brands": ["eternal", "trent", "nykaa"], "amount": 1000, "mode": "sip", "core": true,
  "items": [
    { "slug": "nifty50", "name": "Nifty 50 Index Fund", "share": 0.5, "amount": 500, "r1y": 11.8 },
    { "slug": "eternal", "name": "Zomato", "share": 0.1667, "amount": 166.67, "r1y": 18.2 }
  ],
  "invested": 1000, "value": 1002.75
}
```

**Create a squad**

```http
POST /api/squads
{ "name": "Manali Trip", "emoji": "🏔️", "target": 40000, "months": 4, "memberKeys": ["kabir", "meera"] }
```

Returns the squad with `total`, `progress`, `perHeadMonthly` and `fund` (here a Liquid Fund, since 4 months ≤ 12).

**Validation error**

```http
POST /api/basket
{ "brands": ["eternal"], "amount": 50, "mode": "sip" }
→ 400 { "error": "Amount must be between ₹100 and ₹10,00,000" }
```

**Fund recommendation**

```http
GET /api/funds/recommend?months=48
→ { "type": "equity", "name": "Nifty 50 Index Fund", "risk": "Medium", "ret": 11.8, "why": "Your goal is 4+ years away…" }
```

</details>

## 9. Run it locally

**Requirements:** Node.js 18+ and npm. MongoDB is optional.

```bash
git clone https://github.com/Ujjawall12/genz-invest.git
cd genz-invest
npm run install:all     # root, server and client dependencies
npm run dev             # API on :5000 + app on http://localhost:5173
```

Open **http://localhost:5173**.

### Database options

| Setup | How | Data |
|---|---|---|
| **Zero setup** (default) | Leave `MONGODB_URI` unset | In-memory MongoDB, reset on every restart |
| **Real database** | Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` | Persists |

### Scripts

| Command (from the repo root) | What it does |
|---|---|
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Run API and frontend together with live reload |
| `npm run seed` | Reset the database to the demo state |
| `npm run build` | Production build of the client |
| `npm start` | Run the API as a single server, also serving `client/dist` |

### Environment variables

| Variable | Where | Required | Purpose |
|---|---|---|---|
| `MONGODB_URI` | `server/.env` locally, Vercel project settings in production | Production only | MongoDB connection string, including the database name (`/genz-invest`) |
| `PORT` | `server/.env` | No (default `5000`) | Local API port |

## 10. Deploy it (Vercel + MongoDB Atlas)

**MongoDB Atlas**

1. Create a free **M0** cluster.
2. **Database Access** → add a user. A letters-and-numbers password avoids URL-encoding issues.
3. **Network Access** → add `0.0.0.0/0`. Vercel has no fixed outbound IP addresses; the database is still protected by the username and password.
4. **Connect → Drivers** → copy the string and add the database name before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/genz-invest?retryWrites=true&w=majority`

**Vercel**

1. **Add New → Project** → import this repository.
2. Set **Application Preset** to **Other**. Vercel detects `client/` and `server/` separately and suggests "Services"; this repo is deployed as one project instead.
3. Leave build settings empty. [`vercel.json`](vercel.json) provides them:
   ```json
   {
     "installCommand": "npm install && cd client && npm install --include=dev",
     "buildCommand": "cd client && npm run build",
     "outputDirectory": "client/dist",
     "rewrites": [{ "source": "/api/(.*)", "destination": "/api" }]
   }
   ```
4. Add the environment variable `MONGODB_URI`, then **Deploy**. The first API call seeds the demo data.
5. Check `/api/health` returns `{"ok":true}`.

Every push to `main` redeploys automatically.

**Troubleshooting**

| Symptom | Cause | Fix |
|---|---|---|
| Screens say "Couldn't load this" | API can't reach the database | Vercel → Logs |
| `503 Database not configured` | `MONGODB_URI` missing | Add it, then redeploy |
| Requests time out | Atlas blocks Vercel's IP | Add `0.0.0.0/0` in Network Access |
| `bad auth` in logs | Wrong user or password, or unencoded special characters | Reset the password to letters and numbers |

## 11. Testing and verification

Checks run against the API, locally and against the live deployment:

| Area | Check | Result |
|---|---|---|
| Endpoints | All 14 endpoints return the expected data | ✅ |
| Basket rules | Amount below ₹100 → 400; 6 brands → 400; duplicate or unknown brand → 400 | ✅ |
| Fund rule | 5 months → Liquid, 24 → Short Duration Debt, 48 → Nifty 50 Index | ✅ |
| Squads | Create, contribute (total and feed update), nudge picks lowest contributor | ✅ |
| Bad input | Invalid squad id → 404; unknown contact → 400; malformed JSON → 400 | ✅ |
| Serverless | Missing `MONGODB_URI` → clear 503; parallel cold-start requests all succeed and seed once | ✅ |
| Routing | Unknown `/api` path → 404 JSON; production build serves the app | ✅ |
| Reset | `/demo/reset` restores the starting state | ✅ |

## 12. Design decisions and trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| 50% Nifty 50 core on by default | Loving a brand doesn't make it a good investment; single stocks can fall 30–50% in a year | Lower upside in a strong year; baskets feel slightly less personal |
| Timeline picks the squad's fund | A trip five months away can't absorb a market fall | Lower returns than equity for short goals, by design |
| Members own their own units | No joint ownership, so no disputes over someone else's money | No "group wallet"; each person invests separately |
| Max 5 brands | Keeps the basket focused and the allocation readable | Less choice for power users |
| ₹100 minimum | Matches stipend and part-time budgets | Very small orders cost more to process in a real system |
| Rules enforced server-side | The UI can't be bypassed to break a guardrail | Some logic is duplicated for the live allocation preview |
| One Express app for local and Vercel | Same code path in development and production | Serverless cold starts add ~1 s on the first request |
| No UI framework | Small bundle, full control over the look | More hand-written CSS |

## 13. Scope, limitations and roadmap

**In scope:** brand baskets from spends, the safety core, Squads with contributions, nudges and an activity feed, the fund-by-timeline rule, plain-language brand pages, a combined portfolio.

**Out of scope (mocked or omitted):**

- Real UPI spend tracking, which needs consent flows, Account Aggregator integration and a privacy review
- KYC, payments, demat and order execution
- Login and multiple users: every request acts as one seeded demo user
- Live market data: prices and returns are illustrative
- F&O, crypto and stock research tools

**Roadmap ideas**

1. Real authentication and per-user data
2. Squad invites through shareable links, with each member's own account
3. Rules for leaving a squad early and for squads that miss their target
4. Spend insights through the Account Aggregator framework, with explicit consent
5. Regional language support for Tier 2 and Tier 3 cities

---

<div align="center">
Built for the Groww Product Intern case study · Concept prototype · Mock data only
</div>
