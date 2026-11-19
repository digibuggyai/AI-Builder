# AI PC Builder — Learning Roadmap

The goal is a better version of the Digibuggy AI PC Builder, built step by step,
where you understand every line of code.

## How we work on every step

1. **Concept:** what we are building and why (5–10 minutes of reading).
2. **Build:** we write the code together. You type or review it and run it yourself.
3. **Check:** a clear "done when…" test you can see working.
4. **Exercise:** a small change you make on your own to lock in what you learned.
5. **Commit:** save the progress to Git with a clear message.

Don't skip ahead. Each step uses what the earlier one taught.

---

## Architecture (what we're building)

```
┌──────────────────────┐      HTTPS/JSON      ┌───────────────────────┐
│  frontend/ (Next.js) │  ─────────────────▶  │  backend/ (Hono)      │
│  UI: 3 builder modes │                      │   REST API + AI calls │
└──────────────────────┘                      └──────────┬────────────┘
                                                         │
          shared code: packages/compat (rules)           │
                       packages/db (schema)              ▼
                                         ┌─────────────────────────────┐
                                         │ Railway: Postgres + Redis   │
                                         │ worker: price scraping jobs │
                                         └─────────────────────────────┘
```

Everything is deployed on **Railway**, as separate services in one Railway project:
`web`, `api`, `worker`, `Postgres` and `Redis`.

## Tech stack

| Part | Tool | What it does |
|---|---|---|
| Language | TypeScript | JavaScript with types, so it catches bugs before you run the code |
| Repo structure | pnpm workspaces + Turborepo | Several apps and packages in one repo |
| Frontend | Next.js + Tailwind + shadcn/ui | Pages, UI components, styling |
| Client state | Zustand + TanStack Query | Holds the build being edited; fetches data from the API |
| Backend | Hono (on Node.js) | Small, fast web framework for our REST API |
| Validation | Zod | Checks that incoming data has the right shape |
| Database | PostgreSQL on Railway | Stores parts, prices, builds, users and leads |
| ORM | Drizzle | Write database queries in TypeScript; handles migrations |
| Tests | Vitest | Tests the compatibility engine automatically |
| Auth | Better Auth + MSG91 phone OTP | Login, real phone verification, admin roles |
| Background jobs | BullMQ + Redis on Railway | Scheduled price scraping |
| AI | Claude API (Anthropic SDK) | Quote import from text or images; chat advisor |
| Payments | Razorpay | Booking and payments |
| Monitoring | Sentry + PostHog | Error tracking and analytics |

---

## Phase 0 — Setup (day 1)

- [ ] Install Node.js 22 LTS, pnpm, Git and VS Code extensions (ESLint, Prettier, Tailwind)
- [ ] Create a GitHub repo and run `git init` locally
- [ ] Install the Railway CLI and log in
- **You learn:** terminal basics, what Node/npm/pnpm are, Git (`add`, `commit`, `push`, branches)
- **Done when:** `node -v`, `pnpm -v`, `git --version` and `railway whoami` all work

## Phase 1 — Project skeleton (days 2–3)

- [ ] Create the pnpm + Turborepo monorepo: `frontend/` (Vercel), `backend/` (Railway, includes the database), `shared/` (fit rules)
- [ ] Shared `tsconfig`, ESLint and Prettier
- **You learn:** TypeScript basics (types, interfaces, functions, modules), how a monorepo works
- **Done when:** `pnpm dev` starts both web and API locally

## Phase 2 — Database design (week 1)

- [ ] Create Postgres on Railway and copy the connection URL into `.env`
- [ ] Drizzle schema for the parts tables: `cpus`, `gpus`, `motherboards`, `ram_kits`, `storage`,
      `psus`, `coolers`, `cases`, `monitors`. Every spec gets a real column (socket, form factor,
      GPU length in mm, TDP, etc.); nothing is guessed from product names
- [ ] Tables: `retailers`, `listings` (part × retailer, with URL), `price_history`, `builds`, `users`, `leads`
- [ ] Run the first migration
- **You learn:** tables, columns, primary and foreign keys, relationships, migrations, env variables
- **Done when:** you can see the tables in Drizzle Studio

## Phase 3 — Seeding the catalog (week 2)

- [ ] Set up CSV templates per category
- [ ] Write a seed script that validates every row with Zod before inserting it
- [ ] Start with about 20 parts per category and complete specs; expand later
- **You learn:** Node scripts, reading files, data validation, why clean data matters most
- **Done when:** `pnpm db:seed` fills the database with no validation errors

## Phase 4 — Compatibility engine (week 2–3) ⭐ the core of the product

- [ ] `packages/compat`: pure functions, each rule in its own file
- [ ] Rules: CPU↔motherboard socket, RAM type, slots and max capacity, M.2 slots,
      PSU wattage (total load + headroom), cooler TDP rating, **cooler height ≤ case limit**,
      **GPU length ≤ case limit**, **motherboard form factor fits the case**, radiator support
- [ ] Every rule returns `{ level: "error" | "warning" | "info", message }`
- [ ] Vitest tests for every rule (good builds and broken builds)
- **You learn:** pure functions, test-driven development, edge cases
- **Done when:** `pnpm test` passes and catches every type of incompatible build

## Phase 5 — Backend API + first deploy (week 3–4)

- [ ] Hono server with these endpoints:
  - `GET /parts?category=gpu&socket=AM5&maxPrice=…` (filtering + pagination)
  - `POST /builds/validate` (runs the compatibility engine)
  - `POST /builds` and `GET /builds/:id` (save and share builds)
- [ ] Zod validation on every input; consistent error responses
- [ ] Deploy `api` to Railway and connect it to the Railway Postgres
- **You learn:** HTTP, REST, request and response, status codes, CORS, deployment, logs
- **Done when:** the live Railway URL returns parts as JSON

## Phase 6 — Frontend: Advanced mode (week 4–5)

- [ ] Next.js + Tailwind + shadcn setup, layout, dark theme
- [ ] Landing page with the 3 mode cards and an FAQ (rendered on the server for SEO)
- [ ] Advanced mode: a picker per category with filters, a live total, and a compatibility panel
- [ ] Only show parts that fit what's already selected
- **You learn:** React components, props, state, hooks, Zustand, TanStack Query, responsive design
- **Done when:** you can build a full PC on the web app, and it shows a warning when something doesn't fit

## Phase 7 — Recommendation engine: Pro + Beginner (week 6–7)

- [ ] Use-case profiles (esports, AAA, streaming, creation, AI/ML, office) with minimum specs
- [ ] Budget split across categories, plus a scoring function that picks the best compatible combination
- [ ] Pro mode: the 8-step wizard with a recommendation at each step
- [ ] Beginner mode: about 5 plain-language questions → a complete build
- **You learn:** algorithms, scoring and ranking, multi-step forms, URL state
- **Done when:** "₹80,000, 1440p gaming" produces a sensible, compatible build every time

## Phase 8 — Auth, leads and admin (week 8)

- [ ] Better Auth with real phone OTP via MSG91, enforced on the server
- [ ] User roles: `user` and `admin`; admin routes protected on the server
- [ ] Admin panel: parts CRUD, CSV upload, enable/disable parts, list of leads
- **You learn:** sessions and cookies, hashing, authorization, why front-end checks are not security
- **Done when:** a normal user can't reach the admin API, even by calling it directly

## Phase 9 — Live prices (week 9)

- [ ] `apps/worker` with BullMQ on Railway Redis
- [ ] One scraper per retailer, run on a schedule; write to `price_history`; mark parts out of stock
      (check each retailer's terms and robots.txt first)
- [ ] Show the cheapest current price and a price history chart
- **You learn:** background jobs, queues, cron, scraping, retries, rate limits
- **Done when:** prices update on their own every few hours

## Phase 10 — AI features (week 10–11)

- [ ] Quote import: paste text or upload a screenshot → Claude extracts the parts →
      we match them to our catalog → the build fills in
- [ ] AI advisor chat: Claude gets **tools** (`search_parts`, `validate_build`, `get_prices`),
      so it only recommends real parts at real prices
- [ ] Rate limiting, cost tracking, and a fallback when the AI fails
- **You learn:** LLM APIs, prompts, tool calling, structured output, streaming
- **Done when:** "I want to edit 4K video under ₹1.5L" in chat → a valid build with explanations

## Phase 11 — Quotes, payments and sharing (week 12)

- [ ] PDF quote generated on the server; shareable build links
- [ ] Razorpay booking or advance payment, with a webhook to confirm it
- [ ] WhatsApp handoff with the build link filled in
- **You learn:** webhooks, payment flows, file generation
- **Done when:** a test payment completes and the build is marked as booked

## Phase 12 — Extra features (week 13+)

- [ ] Estimated FPS per game and resolution; bottleneck indicator
- [ ] Price-drop alerts; compare builds side by side; upgrade path for an existing PC
- [ ] Visual case-fit preview

## Phase 13 — Production ready

- [ ] Sentry, PostHog, SEO metadata and sitemap, custom domain on Railway
- [ ] End-to-end tests (Playwright) for the 3 builder modes
- [ ] Database backups and a staging environment

---

## Progress log

| Date | Step | Notes |
|---|---|---|
| | | |
