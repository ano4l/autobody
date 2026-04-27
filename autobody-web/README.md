# autobody-web

Cinematic storefront and operations dashboard for **Ferreira&apos;s Autobody Spares**. Next.js 14 (App Router), TypeScript, Tailwind. Runs as a fully self-contained demo with seeded data — no backend required.

## Setup

```bash
cp .env.example .env.local   # optional — every value can stay blank
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

### Storefront
- `/` — cinematic Vimeo-backed hero, category rail, feature products, banners, headlights, newsletter
- `/shop` — full catalog (filters, sort, pagination, deep-linkable categories)
- `/shop/[slug]` — product detail with gallery, specs, fitment, reviews, related products
- `/cart` — line items, qty, promo code (`FERREIRA10`), totals
- `/checkout` — contact + delivery + payment selector
- `/checkout/payfast` — sandbox PayFast simulation (auto-filled test card)
- `/checkout/success` — order confirmation
- `/about`, `/services`, `/contact` — branded marketing pages

### Workspace
- `/login` — fake login (any email + password works)
- `/dashboard` — single-page operations workspace, deep-linkable via `?section=`:
  - `overview` — commercial command centre (today's sales, channel mix, branch performance, risk register, supplier snapshot)
  - `inventory` — item master, stock health, reorder, bulk actions, mobile card view
  - `pos` — walk-in POS terminal with cart, payment selector, receipt preview
  - `orders` — order ledger with search, status filter, paginated table, New Order modal
  - `conversations` — WhatsApp / SMS / email / phone inbox with reply drawer + escalate / resolve
  - `escalations` — bot-handoff queue with claim / chat / call actions
  - `suppliers` — vendor cards, reorder watch, draft purchase orders
  - `broadcast` — WhatsApp group blast composer with live preview
  - `reviews` — Google review mirror
  - `reports` — recharts breakdowns (revenue, channel mix, time series, top movers, dead stock, margin)
  - `audit`, `notifications`, `faq`, `settings`
- Light + dark theme, collapsible sidebar, mobile bottom nav, animated section transitions
- All data is seeded deterministically from `src/lib/dashboard-autobody-seed.ts` and `src/lib/autobody-ops-demo-data.ts`. Mutations (new orders, escalations, replies, item edits) live in component state and surface through a global toast system (`src/lib/toast.ts`).

## Demo credentials

Demo mode is on by default — any email + password signs you in. The user is synthesised as `Demo Admin` and persisted to `localStorage`.

## Real mode (full stack against `autobody-api`)

Flip the dashboard from seeded data to live backend calls in two steps.

**1. Start the backend.** From `../autobody-api`:

```bash
docker compose up -d                # Postgres 16 + Redis 7
cp .env.local.example .env.local    # JWT_SECRET, DB creds, etc.
mvn spring-boot:run                 # listens on http://localhost:8080
```

Flyway runs `V5__seed_admin_user.sql` on first boot. Default credentials:

```
admin@autobody.local / Admin@1234
```

**2. Start the frontend in real mode.** From this directory, in `.env.local`:

```env
NEXT_PUBLIC_AUTH_MODE=real
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Then `npm run dev`, browse to <http://localhost:3000/login>, sign in with the
backend admin credentials, and the dashboard sections wired in `D2/D3` (overview,
orders, conversations) will fetch live data via `/api/dashboard/stats`,
`/api/orders`, `/api/conversations`. Notifications, audit, and reports remain
seeded for now.

If either flag is missing, behaviour falls back to demo mode (silent). On a
401 from the backend, the dashboard hard-redirects to `/login?next=...`.

See `.env.example` for the full variable reference.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS with `tailwindcss-animate` for the dashboard
- Framer Motion + GSAP + Lenis for the storefront cinematics
- Zustand persistent cart store
- Recharts for dashboard analytics
- Lucide icons

## Deploying

Both **Netlify** (`netlify.toml`) and **Vercel** (`vercel.json`) are configured.
See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for copy-pastable CLI commands, env vars, and post-deploy smoke checks.

The demo is self-contained — zero env vars are required for a working deploy.

## Local commands

```bash
npm run dev        # dev server
npm run build      # production build (static prerender + client routes)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```
