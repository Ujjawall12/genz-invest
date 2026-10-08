# Designing Groww for the GenZ Investor

Product intern case study · October 2026 · [PDF version](GenZ-Invest-Case-Study.pdf)

Two features make investing personal and social for first-time investors aged 20–26: **Own What You Love** and **Squads**.

## Quick links

| Resource | Link |
| --- | --- |
| Live app | [genz-invest.vercel.app](https://genz-invest.vercel.app) |
| Source code | [GitHub repo](https://github.com/Ujjawall12/genz-invest) |
| Two-minute demo script | [Walkthrough](https://github.com/Ujjawall12/genz-invest#3-two-minute-demo-script) |
| Product guardrails | [Rules and limits](https://github.com/Ujjawall12/genz-invest#4-product-rules-and-guardrails) |
| Architecture and API | [Technical docs](https://github.com/Ujjawall12/genz-invest#5-architecture) |
| Live API check | [/api/health](https://genz-invest.vercel.app/api/health) |

## My take on the problem

GenZ investors in India don't lack money habits. They lack investing habits. A 22-year-old intern might spend ₹6,000 a month on Zomato, Zudio and Nykaa, and split a Goa trip four ways on Splitwise, yet hold nothing in a mutual fund.

Two things make investing feel distant. It is **abstract**: "NAV", "large-cap" and "expense ratio" mean nothing next to brands they use every day. And it is **solo**: almost everything else they do with money, they do with friends.

So the gap isn't access, since opening an account is already easy. The gap is relevance. Groww wins this group by making investing look like the rest of their financial life: personal and social.

## Assumptions

- Users are 20–26, investing for the first time, with ₹500–₹5,000 a month and often irregular income.
- They will share UPI spend categories, with consent, for useful insights.
- Short-term shared goals (trips, gadgets, deposits) are common.
- The prototype uses mock prices, spends and payments.

## In scope

1. **Own What You Love:** spend insights ("₹2,340 on Zomato across 9 orders this month") that lead to a basket of up to 5 brands, from ₹100, as a monthly SIP or one-time.
2. **Nifty 50 safety core:** 50% of every basket by default, with a clear warning if the user switches it off.
3. **Squads:** shared goal pots with 1–10 friends, a progress ring, a per-person monthly target, nudges and an activity feed.
4. **Fund-by-timeline rule:** goals up to 12 months go to a liquid fund, up to 36 months to a short duration debt fund, longer to a Nifty 50 index fund.
5. **Plain-language brand pages:** what the company does and why its price moves, with no ratios.

## Out of scope

- Real UPI spend tracking, which needs consent flows, Account Aggregator integration and a privacy review
- KYC, payments, demat and order execution
- F&O, crypto and stock research tools
- Joint legal ownership of squad pots: each member owns their own units
- Login and multi-user accounts: the prototype runs as one demo user
- Disputes and early-exit rules inside squads (future work)

## My solution and why

I built a [working prototype](https://genz-invest.vercel.app) on the MERN stack (React, Express, MongoDB Atlas, hosted on Vercel) with one feature for each barrier. The [code is public](https://github.com/Ujjawall12/genz-invest).

**Own What You Love fixes "abstract".** The entry point is something the user already did: spend money. Seeing "you spent ₹2,340 on Zomato" next to "own a piece from ₹100" turns a stock into something they recognise. Brand pages explain the business in one line instead of showing ratios.

**Squads fix "solo".** Saving for a trip with friends is already normal. Squads keep that behaviour but let the money earn while it waits. Visible group progress adds gentle accountability.

**Guardrails are the real product decision.** Loving a brand doesn't make it a good investment, so every basket defaults to a 50% Nifty 50 core. A trip five months away should never sit in stocks, so the timeline picks the fund, not the user's excitement. Each member owns their own units, so a friend leaving never puts anyone else's money at risk.

**Trade-off.** The core and the liquid funds earn less in strong markets and reduce trading activity. I accept that: a first-time investor who loses 30% in month one rarely comes back, and long-term retention is worth more to Groww than early volume.

## How I'd measure success

Targets are hypotheses to validate in a pilot, not benchmarks.

| Metric | What it tells us | Target |
| --- | --- | --- |
| Accounts making a first investment within 30 days | The activation leak is closing | +15% vs current flow |
| SIPs still active at 6 months | Investing became a habit | 70% |
| Squads with 2+ contributing members | The social loop works | 60% |
| Baskets that keep the safety core | Users accept the guardrail | 80% |
| Invites sent per squad creator | Organic growth | 2.5 |
