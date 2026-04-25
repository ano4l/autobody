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
- `/dashboard` — operations workspace, replicating the e-Requisition design system 1:1
  - State-routed sections via `?section=`: `overview`, `requisitions`, `approvals`, `reports`, `audit`, `notifications`, `faq`, `settings`
  - Light + dark theme, collapsible sidebar, animated section transitions
  - All data is seeded deterministically from `src/lib/dashboard-seed.ts`

## Demo credentials

Demo mode is on — any email + password signs you in. The user is synthesised as `Demo Admin` and persisted to `localStorage`.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS with `tailwindcss-animate` for the dashboard
- Framer Motion + GSAP + Lenis for the storefront cinematics
- Zustand persistent cart store
- Recharts for dashboard analytics
- Lucide icons

## Deploying to Vercel

The repo is Vercel-ready out of the box.

1. Push the `autobody-web` directory to a Git host.
2. In Vercel, **New Project → Import**.
3. Framework preset auto-detects as **Next.js**. No env vars are required (the demo is self-contained).
4. Optional: copy `.env.example` into the project's environment variables if you want to label the deployment with custom demo credentials.
5. Hit **Deploy**.

`vercel.json` pins the framework, build command, and install command. There is no API route that requires server runtime tuning — everything is statically prerendered or rendered on the client.

## Local commands

```bash
npm run dev        # dev server
npm run build      # production build (static prerender + client routes)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```
