# Autobody — Completion Plan

> Path: `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/COMPLETION_PLAN.md`
> Goal: take the Autobody monorepo from "demo-ready" to "polished + deployable end state."
> Scope of this plan: **frontend (`autobody-web`) only** unless a track is explicitly tagged `[backend]`.
> Mode: incremental, one track at a time. Each track ends in a green build + manual smoke check.

---

## Where we are today

### Frontend (`autobody-web`) — what's already done

**Marketing site** (`src/app/(marketing)/...`)
- Home with cinematic Vimeo hero, category rail, feature products + sidebar, banners, headlight section, trust strip, newsletter
- `/shop` catalog with filters / sort / pagination, deep-linkable category & brand
- `/shop/[slug]` product detail with gallery, tabs (description / specs / fitment / reviews), related products
- `/cart` with Zustand persistent store, qty stepper, promo `FERREIRA10`, totals
- `/checkout` with form + delivery + payment selector
- `/checkout/payfast` simulated PayFast gateway (sandbox card, 2s spinner)
- `/checkout/success` clears cart + confirmation
- `/about`, `/services`, `/contact`
- `error.tsx`, `not-found.tsx` branded
- SmoothScrollProvider (Lenis) + Reveal (IntersectionObserver) + Framer Motion microinteractions

**Dashboard SPA** (`src/app/(dashboard)/dashboard` driven by `?section=`)
- Sidebar (collapsible), header, mobile bottom nav
- 14 sections: overview, inventory, pos, orders, conversations, escalations, suppliers, broadcast, reviews, reports, audit, notifications, faq, settings
- All wired with deterministic seed data (`src/lib/dashboard-autobody-seed.ts` + `autobody-ops-demo-data.ts`)
- Light + dark mode, animated section transitions
- Legacy `/orders`, `/inventory`, `/conversations`, `/escalations` routes redirect into the SPA

**Auth & infra**
- Demo login (any email/password works) — `src/lib/auth.ts`, `AuthGuard`
- Vercel-ready: `next.config.mjs` (image patterns + `/backend` rewrite), `vercel.json`, `.env.example`, `README.md`
- `npm run build` and `npm run typecheck` pass

### Backend (`autobody-api`) — current state
- Spring Boot 3.3 + Java 21, JWT auth, Postgres + Redis via Docker
- Modules: user/auth, inventory (parts + suppliers + movements), customer, whatsapp (state machine + webhook + timeout job), order (+ receipt PDF), pos, shopify, dashboard stats, reporting
- Tests: WhatsApp only (handler unit + timeout IT + webhook IT)
- Frontend does **not** currently call any of this — `auth.ts` is hard-coded demo mode

### Known rough edges (the work remaining)

1. Dashboard action buttons in `approvals.tsx`, `requisitions.tsx`, `inventory.tsx`, `pos.tsx`, `escalations.tsx`, etc. fall through to `alert(...)` instead of toasts/modals.
2. No real notification/toast system — `alert()` is the placeholder.
3. Mobile responsiveness on the dashboard is uneven — bottom nav exists but several section grids overflow on narrow viewports (POS terminal, inventory table, reports charts).
4. No automated frontend tests (no Vitest, Playwright, or Cypress).
5. Hero Vimeo loading + image fallbacks are not lazy-optimised; LCP could improve.
6. `progress.md` "Status snapshot" table is stale (Phase 4/5 still says "Not started" but they're scaffolded).
7. Vercel: never actually deployed end-to-end from this workspace.
8. Marketing `/shop` and dashboard `inventory` are different data sources — adding a unified product catalogue would reduce drift.
9. Backend integration: zero endpoints are consumed. The whole `lib/api.ts` + auth refresh flow is dormant.
10. `next-env.d.ts` is fine but `tsconfig.tsbuildinfo` is in the repo (should be gitignored — minor).

---

## Recommended completion roadmap

Tracks are **independent and sequential** unless noted. Start with whichever one the user picks; subsequent tracks can be paused or skipped.

### Track A — Dashboard polish (UX correctness) [high value, ~1 session]

Replace stub interactions and tighten mobile.

A1. **Toast system**
- Add a small `Toaster` (Zustand-backed) and `toast()` helper at `src/lib/toast.ts` + `src/components/ui/toaster.tsx`
- Mount in dashboard layout
- Replace every `alert(...)` in the dashboard with `toast.success` / `toast.info` / `toast.error`

A2. **Action follow-through**
- `approvals.tsx`: Reply opens a side drawer with the conversation thread + composer (still demo, but real UI)
- `escalations.tsx`: "Take over" actually moves the card to a "Mine" lane and assigns owner = current user
- `requisitions.tsx` (Orders): "New Order" opens a modal that adds a pending order to the seeded list
- `inventory.tsx`: row Edit becomes inline form, Delete prompts confirm + removes locally
- `pos.tsx`: "Complete sale" generates a receipt preview (existing component) and stores last 5 sales locally

A3. **Mobile polish**
- Inventory table: swap to card list below `md` breakpoint
- POS section: stack the cart + product grid below `lg`
- Reports: ensure recharts containers respect mobile width (`min-w-0` + horizontal scroll)
- Sidebar collapse default to true below `md`

**Files**
- `src/lib/toast.ts` (new)
- `src/components/ui/toaster.tsx` (new)
- `src/components/ui/conversation-drawer.tsx` (new, optional)
- `src/components/dashboard-v2/sections/{approvals,escalations,requisitions,inventory,pos}.tsx`
- `src/app/(dashboard)/dashboard/page.tsx` (mount toaster)

**Verification**
- `npm run build`, `npm run typecheck` clean
- Manual: every dashboard button gives a toast or opens a real UI; no `alert()` left
- Resize to 375px wide and walk every section without horizontal scroll on the page (tables can scroll inside a container)

---

### Track B — Frontend test coverage (light) [medium value, ~1 session]

B1. Add Playwright + a tiny smoke suite covering:
- `/` loads, hero video / poster visible, category rail scrolls
- `/shop` shows products, category filter narrows the list, pagination clicks work
- Add to cart from product card → cart drawer opens with the item
- Cart → checkout → PayFast → success → cart cleared
- `/login` (any creds) → redirects to `/dashboard`
- Dashboard: clicking each sidebar item changes the URL `?section=...` and renders without crashing
- `/does-not-exist` shows the 404

B2. Wire to `npm test`. Keep CI quiet (no real GitHub Actions yet) — just ensure `npx playwright test` runs locally.

**Files**
- `playwright.config.ts` (new)
- `tests/smoke.spec.ts` (new)
- `package.json` (add `@playwright/test`, `test` script)

**Verification**
- `npx playwright install`
- `npm run dev` in one terminal, `npx playwright test` in another → all green

---

### Track C — Vercel deployment [medium value, ~30 min]

C1. Confirm `vercel.json` and `next.config.mjs` are deploy-clean (already are).
C2. Decide on a project name (`ferreiras-autobody-demo`?) + subdomain.
C3. Ship via the deployment workflow.
C4. Smoke the deployed URL: marketing pages, cart/checkout, dashboard sections, 404.
C5. Add the deployed URL to `README.md` and `progress.md`.

**Files**
- `README.md`, `progress.md` (deploy URL + date)

**Verification**
- Live URL responds 200 on `/`, `/shop`, `/dashboard`, `/login`, returns 404 on `/asdf`

---

### Track D — Backend integration (optional, big lift) [lower priority]

Connect the dashboard to `autobody-api`. Each step is gated on a per-section flag so the demo can stay self-contained as a fallback.

D1. **Real auth**
- Replace `auth.ts` demo bypass with the existing `api.post('/api/auth/login')` flow
- Keep "Demo mode" as a checkbox toggle that synthesises the session client-side

D2. **Per-section data fetchers**
- Inventory → `GET /api/parts`, `POST /api/parts`, `PUT /api/parts/{id}`, `DELETE /api/parts/{id}`
- Suppliers → `/api/suppliers` CRUD
- Orders → `/api/orders` CRUD + `GET /api/orders/{id}/receipt`
- POS → `/api/pos/sessions` open/active/close + create order
- Conversations → `/api/conversations`, `/api/conversations/{id}` (mark resolved)
- Escalations → `/api/conversations?status=ESCALATED`, claim, resolve
- Reports → `/api/dashboard/stats`, `/api/reports/sales`, `/api/reports/top-parts`, `/api/reports/dead-stock`, `/api/reports/margin`
- Broadcast → `POST /api/broadcast`

D3. **Loading + error states**
- Use React Suspense + a unified `useResource(fetcher)` hook
- Surface backend errors via the toaster (Track A1)

D4. **Env wiring**
- `NEXT_PUBLIC_API_BASE_URL` in `.env.local` + Vercel env
- Same-origin `/backend/*` rewrite is already configured

**Verification**
- Boot `autobody-api` via `docker-compose up` then `mvn spring-boot:run`
- Sign in with the bootstrapped admin (`Admin@1234`)
- Each section shows real data; toggling demo mode falls back to seed

---

### Track E — Backend completion [lower priority, mostly tests]

E1. Add integration tests for order + POS atomicity (stock movement on order create / cancel)
E2. Add integration tests for shopify webhook HMAC + order import
E3. Real-time WhatsApp inbox (SSE endpoint or short-poll) so escalations show up without manual refresh
E4. Update `progress.md` "Status snapshot" so it matches reality (Phase 4–6 are scaffolded, not "Not started")

**Verification**
- `mvn -pl autobody-api test` runs all suites green
- Hit `/api/conversations/stream` from the frontend; new ESCALATED rows render automatically

---

### Track F — Tiny polish list (do alongside any track)

- Remove `tsconfig.tsbuildinfo` from the repo + add to `.gitignore`
- Update `README.md` Routes block — it lists obsolete sections (`requisitions`, `approvals`) instead of the current 14
- Add favicon + OG image for the marketing site
- Lighthouse pass on `/` and `/shop` — fix any LCP/CLS regressions

---

## Recommendation

Most realistic path to a polished, demo-able product:

**Track A** (dashboard polish + toaster) → **Track C** (Vercel deploy) → **Track B** (Playwright smoke) → **Track F** (tiny polish list).

Defer **Track D / E** unless the brief is "wire it to a real backend."

Total: ~2–3 focused sessions to reach a confidently shippable demo.

---

## Files to modify (consolidated, by track)

**Track A**
- `src/lib/toast.ts` (new)
- `src/components/ui/toaster.tsx` (new)
- `src/components/dashboard-v2/sections/approvals.tsx`
- `src/components/dashboard-v2/sections/requisitions.tsx`
- `src/components/dashboard-v2/sections/inventory.tsx`
- `src/components/dashboard-v2/sections/pos.tsx`
- `src/components/dashboard-v2/sections/escalations.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`

**Track B**
- `playwright.config.ts`, `tests/smoke.spec.ts`
- `package.json`

**Track C**
- `vercel.json` (verify), `README.md`, `progress.md`

**Track D** (if pursued)
- `src/lib/auth.ts`, `src/app/login/page.tsx`
- All `src/components/dashboard-v2/sections/*.tsx`
- `src/lib/api.ts` (review)

**Track E** (if pursued)
- `autobody-api/src/test/java/com/autobody/order/...`
- `autobody-api/src/main/java/com/autobody/whatsapp/EscalationStreamController.java`
- `progress.md`

---

## Verification across all tracks

After each track, run:

```powershell
cd autobody-web
npm run typecheck
npm run lint
npm run build
```

End-to-end smoke (manual or after Track B):
1. `/` → cinematic hero, smooth scroll, no horizontal scroll on category rail
2. `/shop` → filter narrows results, deep-link `/shop?category=Headlights` works
3. `/shop/[slug]` → gallery + add to cart → cart drawer opens
4. `/cart` → promo `FERREIRA10` applies 10%
5. Checkout → PayFast sim → success → cart cleared
6. `/login` (any creds) → `/dashboard`
7. Cycle every sidebar item; no `alert()` boxes after Track A
8. Toggle dark mode; URL `?section=...` updates; deep-link works on refresh
9. `/does-not-exist` → branded 404
