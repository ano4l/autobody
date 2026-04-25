# Ferreira's Autobody — Multi-Page Rework + Smoothness Pass

## Goals (from user)

1. **Remove the horizontal scrollbar** under the blue Categories strip (image 1 — circled).
2. **Fix the empty-space imbalance** where the right sidebar (Top Trending) is taller than the left products column (image 2).
3. **Re-add scroll-based storytelling & animations** that were stripped during the AutoPlanet rework, plus micro-animations, page animations, hover interactions, etc.
4. **Replicate the buttery smoothness of the Jukas reference** (image 3) — not the layout, just the feel.
5. **Convert to a real multi-page site**: catalog should be its own page with all products; checkout should simulate PayFast end-to-end.
6. **Overall polish for performance, UX, and edge cases**.

## Tech stack additions

Install:
- `gsap` — scroll-trigger timelines (already imported by `@/app/(marketing)/page.tsx:4-5` but not in `package.json`, so builds are currently broken/transient).
- `framer-motion` — page transitions, micro-interactions, layout animations.
- `lenis` — smooth-scroll (the "Jukas" feel).
- `zustand` — tiny persistent cart store (no prop-drilling, localStorage-backed).

## Final file layout

### New / changed routes (App Router)

```
src/app/
├── layout.tsx                              # + Lenis + Framer AnimatePresence provider (client wrapper)
├── error.tsx                               # NEW — error boundary (user has it open)
├── not-found.tsx                           # NEW — 404 (user has it open)
├── globals.css                             # + scrollbar-hide util, easing tokens, hide Ferrari/GSAP legacy CSS that still fires
├── (marketing)/
│   ├── layout.tsx                          # Keep shell → now renders <SiteHeader/> <SiteFooter/> around children
│   ├── page.tsx                            # Home only: hero + categories + feature strip + CTAs + testimonials
│   ├── shop/
│   │   ├── page.tsx                        # NEW — full catalog: filters rail + grid + sort + pagination
│   │   └── [slug]/page.tsx                 # NEW — product detail: gallery, tabs, related, add-to-cart
│   ├── cart/page.tsx                       # NEW — cart review (line items, qty, totals, promo)
│   ├── checkout/
│   │   ├── page.tsx                        # NEW — shipping + payment method picker
│   │   ├── payfast/page.tsx                # NEW — simulated PayFast gateway UI (orange/blue brand, test card)
│   │   └── success/page.tsx                # NEW — confirmation page (clears cart)
│   ├── about/page.tsx                      # Existing — restyle to match new design language
│   ├── services/page.tsx                   # Existing — restyle
│   └── contact/page.tsx                    # Existing — restyle
└── (dashboard)/                            # Untouched
```

### New components

```
src/components/marketing/
├── site-header.tsx            # Sticky + scroll-hide, cart badge live-bound, mobile drawer
├── site-footer.tsx            # Dark footer, newsletter inline
├── product-card.tsx           # Extracted from page.tsx, + framer-motion hover, add-to-cart flash
├── mini-product-card.tsx      # Extracted
├── promo-card.tsx             # Sidebar dark promo blocks
├── category-rail.tsx          # Blue categories strip with working arrow buttons (scrollBy)
├── cinematic-hero.tsx         # Restored Ferrari hero (video bg + parallax layers + GSAP timeline)
├── smooth-scroll-provider.tsx # Client: Lenis + ScrollTrigger sync, respects prefers-reduced-motion
├── reveal.tsx                 # Wrapper: <Reveal variant="fade-up">children</Reveal> using IntersectionObserver + framer-motion
├── cart-drawer.tsx            # Slide-in from right, triggered by header cart button
└── page-transition.tsx        # AnimatePresence wrapper for route changes (client layout)
```

### Shared libs

```
src/lib/
├── products.ts                # Single source of truth: ~30 products w/ slug, images, specs
├── cart-store.ts              # Zustand store w/ localStorage persist
├── payfast.ts                 # Ref generator, amount formatter, sandbox test card info
└── motion.ts                  # Shared easings & variants (fadeUp, stagger, cardHover)
```

## Specific fixes

### 1 — Hide the horizontal scrollbar (image 1)

- In `globals.css` add a `.scrollbar-hide` utility: `&::-webkit-scrollbar { display: none }; scrollbar-width: none;`.
- Replace the `flex gap-3 overflow-x-auto pb-2` on the Categories rail with `scrollbar-hide`.
- Wire the existing `←` / `→` buttons to `ref.current.scrollBy({ left: ±200, behavior: 'smooth' })`.

### 2 — Fix the empty-space imbalance (image 2)

Two changes:
- Add `self-start` to the `<aside>` in the Feature Products grid so it doesn't force the row to stretch.
- Drop Top Trending from 8 tiles (2×4) to **4 tiles (2×2)** to match the feature products block; move the other 4 into a new "Recently Viewed" rail lower on the page (or onto `/shop`).
- For the Headlights section, match the left column row count to the aside: either add a second row of 4 headlight products (making 2×4) OR shrink the sidebar.

### 3 — Hero: bring back the cinematic Ferrari

Keep the AutoPlanet-style vehicle finder, but under it restore the full hero from the previous iteration, extracted into `cinematic-hero.tsx`:
- Video background (Mixkit CDN with Unsplash poster fallback) + Ferrari CSS silhouette + parallax orbs + speed lines + road pulse.
- GSAP intro timeline: `hero-kicker` → `hero-word` stagger → `hero-sub` → `hero-cta` → `scroll-cue`.
- ScrollTrigger parallax: `hero-video` scrub yPercent 18 + scale 1.1; `hero-content` fade/translate out on scroll; depth-1 orbs drift.
- Keep the `prefers-reduced-motion` guard (set all animated elements to opacity 1 / identity transform).

### 4 — Smooth scrolling & global animations

- `smooth-scroll-provider.tsx` mounts Lenis once, drives `requestAnimationFrame`, and calls `ScrollTrigger.update()` each frame so GSAP stays in lock-step.
- `layout.tsx` wraps children with the provider + `<AnimatePresence mode="wait">` for soft page transitions.
- Custom scrollbar already exists in `globals.css:106-115` — keep but thin it.

### 5 — Micro-animations (Framer Motion)

Per-component:
- **Header nav link**: underline slide in via `layoutId` when `usePathname()` matches.
- **Buttons**: `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}` using a shared `<MotionButton/>` wrapper.
- **Product card**: hover lifts 6px + image zoom 1.05 + shadow grow; add-to-cart button emits a check-mark flash + cart-count bounce via `animate` keyframes.
- **Cart drawer**: slide + fade from right, backdrop fade.
- **Reveal wrapper**: `<Reveal>` hooks IntersectionObserver → triggers `motion.div` with fadeUp + stagger variants. Used on every section.
- **Counters**: animate statistic numbers 0→target on scroll into view.

### 6 — Scroll-based storytelling re-added (GSAP)

Keep all the old acts (Hero parallax, Brands cascade, Parts stagger, Why alternate slide, Catalog fade, Quote dramatic), but scope them to the home page and the new sections actually in use. Class hooks stay the same (`.brand-card`, `.category-card`, etc.) so no CSS churn.

Additional scroll moments:
- Categories strip cards slide in with x-stagger when entering view.
- Banner CTAs get a parallax bg-image yPercent on scroll.
- "New Products" section: image scales subtly 1.02 → 1 on scroll into view; form slides from right.
- Footer: fade + slight y-lift on enter.

### 7 — `/shop` (real catalog)

- Left filters rail (sticky): Category (checkbox list), Brand, Condition, Price range slider, Rating.
- Top bar: sort dropdown (Price ↑/↓, Newest, Rating), view toggle (grid/list), result count.
- Grid: 12 products/page, paginate client-side (no backend yet).
- Each card links to `/shop/[slug]`.
- Breadcrumb: Home / Shop / {category}.
- Empty state with cleared-filter CTA.

### 8 — `/shop/[slug]` (product detail)

- Image gallery (main + thumb rail, keyboard arrow nav).
- Title, price, star rating, stock badge, short desc.
- Qty stepper + Add to Cart (framer-motion flash) + Buy Now (→ cart + /checkout).
- Tabs: Description / Specifications / Fitment / Reviews.
- Related products rail (random 4 from same category).

### 9 — `/cart`

- Line items (thumbnail, name, brand/model, qty stepper, line total, remove).
- Totals: subtotal, delivery (flat R120 or Free > R2500), tax (15% VAT shown separately), grand total.
- Promo code (accepts `FERREIRA10` → 10% off for demo).
- "Continue Shopping" + "Proceed to Checkout" buttons.
- Empty state.

### 10 — `/checkout`

- Steps indicator (Cart → Details → Payment → Done).
- Form: contact (name, email, phone), delivery address, delivery method (Pickup free / Courier R120), notes.
- Payment method picker: PayFast (card/instant EFT/Zapper) or EFT (manual).
- Sticky order summary on right.
- Submit → pushes to `/checkout/payfast?ref=FERR-{ts}&amount=...`.

### 11 — `/checkout/payfast` (simulation)

Styled to evoke PayFast (orange CTA + deep blue header, Ferreira's logo as merchant):
- Header: "Payfast secure checkout" with lock icon.
- Merchant block: "Ferreira's Autobody Spares" + order ref + amount.
- Payment method tabs (Card active).
- Card form pre-filled with sandbox test card: `4111 1111 1111 1111`, `12/25`, `123`, note "Test mode — no real payment taken".
- "Pay R{amount}" button → simulates 2s processing (spinner) → redirects to `/checkout/success?ref=...`.
- Cancel link returns to `/checkout`.

### 12 — `/checkout/success`

- Green check hero, ref number, amount paid, ETA message.
- Next-step cards (fitment confirmation, tracking, WhatsApp support).
- Calls `useCartStore.clear()` on mount.

### 13 — Error + 404 pages

- `src/app/not-found.tsx`: branded 404 (Ferreira's shopfloor vibe), "Back to home" + "Browse catalog" buttons, subtle float animation on a lost-bolt illustration (CSS only).
- `src/app/error.tsx`: client error boundary with Retry.

## Performance

- Next `<Image>` for all Unsplash products; add `images.remotePatterns` for `images.unsplash.com` in `next.config.mjs`.
- Dynamic import GSAP + ScrollTrigger inside the provider (client only).
- Split product data so `/shop` doesn't eagerly load detail-page-only fields.
- `prefers-reduced-motion` honored in SmoothScrollProvider (skip Lenis) and every GSAP timeline.
- Font-display swap already set in `@/app/layout.tsx`.

## Files to modify / create (exact paths)

Create:
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/lib/products.ts`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/lib/cart-store.ts`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/lib/payfast.ts`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/lib/motion.ts`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/site-header.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/site-footer.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/product-card.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/mini-product-card.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/promo-card.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/category-rail.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/cinematic-hero.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/smooth-scroll-provider.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/reveal.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/components/marketing/cart-drawer.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/shop/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/shop/[slug]/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/cart/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/checkout/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/checkout/payfast/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/checkout/success/page.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/not-found.tsx`
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/error.tsx`

Modify:
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/package.json` — add gsap, framer-motion, lenis, zustand.
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/next.config.mjs` — `images.remotePatterns` for `images.unsplash.com` and `assets.mixkit.co`.
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/layout.tsx` — wrap in `<SmoothScrollProvider>` + `<PageTransition>`.
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/layout.tsx` — inject SiteHeader / SiteFooter; strip the white `min-h-screen bg-white` wrapper in favor of the dark design system.
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/(marketing)/page.tsx` — slim to home-only sections, remove in-file product/cart/filter state, consume store + extracted components; add scrollbar-hide + self-start fixes.
- `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/src/app/globals.css` — add `.scrollbar-hide`, review/collapse Ferrari-era selectors that could conflict.

## Execution order (one subtask at a time)

1. **Deps**: update `package.json`, run `npm install gsap framer-motion lenis zustand`.
2. **Shared libs**: `products.ts`, `cart-store.ts`, `payfast.ts`, `motion.ts`.
3. **Shared UI**: Reveal, SmoothScrollProvider, SiteHeader, SiteFooter, ProductCard, MiniProductCard, PromoCard, CategoryRail, CinematicHero, CartDrawer.
4. **Root layout**: wire provider + page transition + add images remote pattern.
5. **Home page**: rewrite to use extracted components; apply scrollbar-hide + self-start + balanced columns.
6. **Shop page**: filters + grid + sort + pagination.
7. **Shop detail page**: gallery + tabs + related.
8. **Cart page**: totals + promo + proceed.
9. **Checkout**: form + summary.
10. **PayFast sim**: branded gateway UI + 2s processing → redirect.
11. **Success page**: clear cart + confirmation.
12. **404 + error boundaries**.
13. **Restyle about / services / contact** to match the new shell.
14. **Animation polish**: hero timeline + section reveals + hover states.

### 14 — Fake auth (user request)

- `@/lib/auth.ts` `getAccessToken()` → return a stable fake token so `AuthGuard` never redirects.
- `@/components/shell/auth-guard.tsx` → drop the guard / short-circuit to always render children.
- `@/app/login/page.tsx` → on submit, skip `api.post` and synthesise a `LoginResponse` (fake JWT + fake user), call `saveSession`, then `router.replace("/dashboard")`. Any email + password works. Keep the UI; add a tiny "Demo mode — any credentials work" hint.
- No other routes are auth-protected on the marketing side, so customers can freely go through cart → checkout → PayFast sim without signing in.

## Verification

After each subtask:
- `npm run typecheck` — no TS errors.
- `npm run lint` — no new warnings.
- `npm run build` — production build passes.

End-to-end smoke test (manual or Playwright):
1. `npm run dev`, open `/`: hero plays cinematic intro, scroll feels smooth, categories strip has no visible scrollbar, arrow buttons scroll it, no empty space below sidebar.
2. Click a category → lands on `/shop?category=…` with that filter active.
3. Click a product → `/shop/[slug]` gallery + add to cart → toast + cart count bumps.
4. `/cart` → qty stepper works, totals recalc, promo code `FERREIRA10` applies 10%.
5. Proceed to checkout → fill details → pick PayFast → redirected to `/checkout/payfast?ref=…&amount=…` with PayFast-styled page.
6. Click Pay → 2-second spinner → `/checkout/success`, cart cleared.
7. Navigate back with browser back button — page transition fades, state preserved.
8. Visit `/does-not-exist` → branded 404.
9. Force an error (throw in a test page) → `error.tsx` shows Retry.
10. Toggle OS "Reduce motion" → Lenis disabled, GSAP keeps elements visible, no animation weirdness.

Path: `c:/Users/anoti/OneDrive/Desktop/Autobody/autobody-web/PLAN.md`
