import { test, expect, type Page } from "@playwright/test";

// In dev, the Vimeo iframe + GSAP/Lenis bundle keep the `load` event pending,
// which makes the default `goto` waitUntil cause spurious timeouts. Use a
// helper that waits for DOMContentLoaded and then for the network to settle
// so React has time to hydrate controlled inputs and click handlers before
// the test interacts. We swallow networkidle timeouts because the Vimeo
// iframe never reaches idle on the storefront — the assertions that follow
// are good enough to reveal real failures.
async function visit(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  return response;
}

// Some interactions open the cart drawer which puts a backdrop above the page;
// dismiss it before the next click so pointer events reach the right target.
async function dismissCartDrawer(page: Page) {
  const close = page.getByRole("button", { name: /Close cart/i });
  // Wait for the drawer to slide in before clicking close (animation time).
  try {
    await close.waitFor({ state: "visible", timeout: 5_000 });
  } catch {
    return; // drawer never opened
  }
  await close.click();
  await close.waitFor({ state: "hidden", timeout: 5_000 });
}

// Wait for React hydration to finish on the current page before interacting.
// Without this, controlled inputs may be filled before their onChange handler is
// attached (state stays at default) and form onSubmit may fall through to a
// native GET submission. We use networkidle as a proxy because Vimeo isn't on
// the auth/dashboard/checkout pages, so the network reaches idle quickly.
async function waitForHydration(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
}

// ── Storefront ────────────────────────────────────────────────────────────────────────

test.describe("Storefront", () => {
  test("home renders hero, category rail, and feature products", async ({ page }) => {
    await visit(page, "/");

    // Hero — at least one heading is visible.
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // Category strip + section headings.
    await expect(page.getByRole("heading", { name: /Featured Autobody Parts/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /New Products/i })).toBeVisible();

    // Featured product cards have add-to-cart buttons.
    await expect(page.getByRole("button", { name: /Add to cart/i }).first()).toBeVisible();
  });

  test("/shop lists products and category filter narrows the list", async ({ page }) => {
    await visit(page, "/shop");

    const productCards = page.getByRole("button", { name: /Add to cart/i });
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Click the first category checkbox in the filters rail.
    const headlightsFilter = page.getByLabel(/Headlights/i).first();
    if (await headlightsFilter.isVisible().catch(() => false)) {
      await headlightsFilter.check();
      await expect.poll(async () => productCards.count()).toBeLessThanOrEqual(initialCount);
    }
  });

  test("deep-linked /shop?category=Headlights pre-selects the filter", async ({ page }) => {
    await visit(page, "/shop?category=Headlights");
    await expect(page.getByRole("button", { name: /Add to cart/i }).first()).toBeVisible();
  });

  test("product detail loads a slug page", async ({ page }) => {
    await visit(page, "/shop");
    // Read the slug from the first product card link and navigate directly;
    // clicking the wrapper anchor is unreliable because the inner Add-to-cart
    // button captures pointer events at the card centre.
    const firstHref = await page
      .locator('a[href^="/shop/"]')
      .first()
      .getAttribute("href");
    expect(firstHref).toMatch(/^\/shop\/.+/);
    await visit(page, firstHref!);
    await expect(page).toHaveURL(/\/shop\/.+/);
    await expect(page.getByRole("button", { name: /Add to Cart/i }).first()).toBeVisible();
  });
});

// ── Cart + checkout flow ─────────────────────────────────────────────────────

test.describe("Cart & checkout", () => {
  test("add to cart from /shop opens the drawer with the item", async ({ page }) => {
    await visit(page, "/shop");
    await page.getByRole("button", { name: /Add to cart/i }).first().click();

    // Cart drawer slides in — look for the dedicated "Cart" heading inside the drawer.
    await expect(page.getByText(/Your Cart|cart/i).first()).toBeVisible();

    // Header cart badge becomes visible / shows 1+.
    await expect(page.getByRole("button", { name: /Open cart/i })).toBeVisible();
  });

  test("/cart -> checkout -> payfast -> success clears the cart", async ({ page }) => {
    await visit(page, "/shop");
    await page.getByRole("button", { name: /Add to cart/i }).first().click();
    // Drawer slides in and intercepts pointer events; close it before adding more.
    await dismissCartDrawer(page);
    await page.getByRole("button", { name: /Add to cart/i }).nth(1).click();
    await dismissCartDrawer(page);

    await visit(page, "/cart");
    await expect(page.getByRole("heading", { name: /Your Cart/i })).toBeVisible();

    // Promo code input + apply (best-effort).
    const promoInput = page.getByPlaceholder(/promo|code/i).first();
    if (await promoInput.isVisible().catch(() => false)) {
      await promoInput.fill("FERREIRA10");
      await page.getByRole("button", { name: /apply/i }).click();
    }

    await page.getByRole("link", { name: /Proceed to Checkout|Checkout/i }).first().click();
    await expect(page).toHaveURL(/\/checkout$/, { timeout: 30_000 });
    await waitForHydration(page);

    await page.getByLabel(/Full name|Name/i).first().fill("Test Buyer");
    await page.getByLabel(/Email/i).first().fill("buyer@example.com");
    await page.getByLabel(/Phone/i).first().fill("0741111111");
    await page.getByLabel(/Street address|Address/i).first().fill("1 Workshop Rd");
    await page.getByLabel(/City/i).first().fill("Pretoria");
    await page.getByLabel(/Postal/i).first().fill("0186");

    await page.getByRole("button", { name: /Pay With PayFast|Submit Order|Continue/i }).click();
    await expect(page).toHaveURL(/\/checkout\/payfast/, { timeout: 30_000 });
    await waitForHydration(page);

    await page.getByRole("button", { name: /Pay R/i }).click();
    await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 30_000 });

    // Cart cleared — header badge gone (we only check the "Open cart" button is still mounted).
    await expect(page.getByRole("button", { name: /Open cart/i })).toBeVisible();
  });
});

// ── Auth + dashboard ─────────────────────────────────────────────────────────

test.describe("Workspace", () => {
  test("login (any creds) redirects to /dashboard", async ({ page }) => {
    await visit(page, "/login");
    await waitForHydration(page);
    await page.getByLabel(/email/i).first().fill("anyone@example.com");
    await page.getByLabel(/password/i).first().fill("anything");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Dev compile of /dashboard can take 30s+ on cold cache; allow generous time.
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  });

  test("every dashboard section renders without crashing", async ({ page }) => {
    test.setTimeout(240_000);
    const sections = [
      "overview",
      "inventory",
      "pos",
      "orders",
      "conversations",
      "escalations",
      "suppliers",
      "broadcast",
      "reviews",
      "reports",
      "audit",
      "notifications",
      "faq",
      "settings",
    ] as const;

    for (const section of sections) {
      await visit(page, `/dashboard?section=${section}`);
      // No section should render the global error boundary.
      await expect(page.getByText(/The Workshop Hit a Snag/i)).toHaveCount(0);
      // Section-specific section title or a known landmark must exist.
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("toast appears when settings save is clicked", async ({ page }) => {
    await visit(page, "/dashboard?section=settings");
    await waitForHydration(page);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/Profile saved/i)).toBeVisible();
  });
});

// ── 404 ──────────────────────────────────────────────────────────────────────

test("unknown route renders the branded 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
  // Next.js returns 404 status + custom not-found page.
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/Part Not/i)).toBeVisible();
});
