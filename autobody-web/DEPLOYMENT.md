# Deployment Guide — autobody-web

Two pre-configured deploy targets are ready. Pick whichever you prefer.

---

## Real mode vs demo mode

The site ships in **demo mode** by default — `/login` accepts anything, the
dashboard renders from seeded data in `src/lib/dashboard-autobody-seed.ts`,
and zero env vars are required for a working deploy.

To wire the dashboard up to the Spring Boot backend in `../autobody-api`,
set both of these on the deploy target:

- `NEXT_PUBLIC_AUTH_MODE` = `real`
- `NEXT_PUBLIC_API_BASE_URL` = full https URL of the deployed `autobody-api`
  (e.g. `https://autobody-api.fly.dev`)

If only one is set, login will fail (real-mode auth without a backend) or the
backend calls will hit `localhost`. See `.env.example` for the full table.

---

## Option 1 — Netlify (config: `netlify.toml`)

Uses the official `@netlify/plugin-nextjs` for full SSR + image optimisation.

### One-time setup

```powershell
npm install -g netlify-cli
netlify login
```

### Deploy a preview

```powershell
cd c:\Users\anoti\OneDrive\Desktop\Autobody\autobody-web
netlify deploy --build
```

The CLI prints a deploy preview URL. Smoke-test it.

### Promote to production

```powershell
netlify deploy --build --prod
```

### Custom subdomain

When prompted by `netlify init` (or in the dashboard):

- **Site name**: `ferreiras-autobody` → resolves to `https://ferreiras-autobody.netlify.app`

### Environment variables

`netlify.toml` already pins `NEXT_PUBLIC_SITE_URL` to the netlify subdomain. If
you wire it up to a custom domain, override that variable in the Netlify
dashboard so OG and `metadataBase` resolve correctly.

| Var | When required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Custom domain | `https://<your-domain>` |
| `NEXT_PUBLIC_AUTH_MODE` | Real backend | `real` (any other value = demo) |
| `NEXT_PUBLIC_API_BASE_URL` | Real backend | `https://<your-api-host>` |

The `next.config.mjs` rewrite proxies `/backend/*` → `${NEXT_PUBLIC_API_BASE_URL}/*`,
so same-origin calls work in both modes.

---

## Option 2 — Vercel (config: `vercel.json`)

### One-time setup

```powershell
npm install -g vercel
vercel login
```

### Deploy a preview

```powershell
cd c:\Users\anoti\OneDrive\Desktop\Autobody\autobody-web
vercel
```

### Promote to production

```powershell
vercel --prod
```

### Project name

Vercel prompts on first deploy:

- **Project name**: `ferreiras-autobody` → `https://ferreiras-autobody.vercel.app`

### Environment variables

In the Vercel dashboard → Project → Settings → Environment Variables:

| Var | When required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Always (canonical OG/metadata) | `https://<your-vercel-domain>` |
| `NEXT_PUBLIC_AUTH_MODE` | Real backend | `real` |
| `NEXT_PUBLIC_API_BASE_URL` | Real backend | `https://<your-api-host>` |

Leaving the auth/API pair unset keeps the site in demo mode.

---

## Smoke checks after deploy

Open the live URL and verify:

1. `/` — cinematic hero loads, category rail scrolls horizontally, no overflow
2. `/shop` — products render, filters narrow the list, pagination clicks
3. `/shop/<any-slug>` — product detail with gallery + add to cart
4. `/cart` → `/checkout` → `/checkout/payfast` → `/checkout/success` (cart clears)
5. `/login` (any creds) → `/dashboard`
6. `/dashboard?section=inventory` (and every other `?section=`) renders
7. Click an action that fires a toast — toast appears bottom-right (sm+) or bottom-centre (mobile)
8. `/does-not-exist` → branded 404

---

## After deploy

Update the live URL in two places:

1. `README.md` — add a top "Live demo" line.
2. `progress.md` — add the deploy URL + date next to **Phase 7**.

Then commit:

```powershell
git add README.md progress.md
git commit -m "docs: live demo URL"
git push
```
