# Autobody Automation System — Progress

> Living log of what's built, what's in progress, and what's next. Re-read at the start of every session before touching code.

---

## Status snapshot

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Spring Boot foundation: pom, migrations, security, user/auth | ✅ Complete |
| **Phase 2** | Inventory module: suppliers, parts, stock movements, CSV import | 🟡 In progress |
| **Phase 3** | Customer + WhatsApp bot (webhook, state machine in Redis) | ✅ Complete |
| **Phase 4** | POS + Orders + Receipts (PDFBox) | ⏳ Not started |
| **Phase 5** | Shopify sync (webhooks + Quartz jobs) | ⏳ Not started |
| **Phase 6** | Dashboard endpoints + Reports | 🟡 In progress |
| **Phase 7** | Next.js dashboard + public website | 🟡 In progress |

---

## Completed

### Phase 1 — Backend foundation ✅

**Project skeleton**
- [autobody-api/pom.xml](autobody-api/pom.xml) — Spring Boot 3.3.4, Java 21, JPA, Security, Redis, Quartz, WebFlux, SpringDoc, PDFBox, MapStruct, Lombok, jjwt 0.12.5, Flyway (core + postgresql), Actuator
- [autobody-api/Dockerfile](autobody-api/Dockerfile) — multi-stage, Maven base image for build, Alpine JRE for runtime, non-root user
- [autobody-api/docker-compose.yml](autobody-api/docker-compose.yml) — Postgres 16 + Redis 7 with healthchecks
- [autobody-api/.env.local.example](autobody-api/.env.local.example), [.gitignore](autobody-api/.gitignore), [README.md](autobody-api/README.md)

**Config**
- [application.properties](autobody-api/src/main/resources/application.properties) + [application-local.properties](autobody-api/src/main/resources/application-local.properties) + [application-prod.properties](autobody-api/src/main/resources/application-prod.properties)
- [config/SecurityConfig.java](autobody-api/src/main/java/com/autobody/config/SecurityConfig.java) — stateless JWT, CORS, method-level `@PreAuthorize`, public webhook + swagger paths, bcrypt-12 encoder
- [config/RedisConfig.java](autobody-api/src/main/java/com/autobody/config/RedisConfig.java) — JSON serialiser with Jackson + JavaTimeModule
- [config/AsyncConfig.java](autobody-api/src/main/java/com/autobody/config/AsyncConfig.java), [config/QuartzConfig.java](autobody-api/src/main/java/com/autobody/config/QuartzConfig.java), [config/OpenApiConfig.java](autobody-api/src/main/java/com/autobody/config/OpenApiConfig.java) — grouped APIs (public / dashboard), bearer-JWT scheme

**Flyway migrations** — `src/main/resources/db/migration/`
- V1 users (+ email idx)
- V2 suppliers, parts (with `version` for optimistic lock), stock_movements (+ indexes)
- V3 customers, conversations, messages (+ indexes)
- V4 orders (with `version`), order_items (cascade delete), pos_sessions (+ indexes)
- V5 admin seed (`ON CONFLICT (email) DO NOTHING`) — placeholder hash; see AdminBootstrap

**Security layer**
- [security/Role.java](autobody-api/src/main/java/com/autobody/security/Role.java) — ADMIN, SALESPERSON, WAREHOUSE, VIEW_ONLY
- [security/JwtService.java](autobody-api/src/main/java/com/autobody/security/JwtService.java) — HS256, access + refresh tokens, issuer check, 256-bit secret guard
- [security/JwtAuthFilter.java](autobody-api/src/main/java/com/autobody/security/JwtAuthFilter.java) — OncePerRequestFilter, rejects non-access tokens
- [security/AppUserPrincipal.java](autobody-api/src/main/java/com/autobody/security/AppUserPrincipal.java), [security/UserDetailsServiceImpl.java](autobody-api/src/main/java/com/autobody/security/UserDetailsServiceImpl.java)

**Shared primitives**
- [shared/audit/AuditableEntity.java](autobody-api/src/main/java/com/autobody/shared/audit/AuditableEntity.java) — `@CreatedDate` / `@LastModifiedDate`
- [shared/dto/ApiResponse.java](autobody-api/src/main/java/com/autobody/shared/dto/ApiResponse.java) — `ok / paged / error` factories
- [shared/dto/PagedResponse.java](autobody-api/src/main/java/com/autobody/shared/dto/PagedResponse.java) — Spring `Page` → DTO
- [shared/exception/GlobalExceptionHandler.java](autobody-api/src/main/java/com/autobody/shared/exception/GlobalExceptionHandler.java), [ResourceNotFoundException.java](autobody-api/src/main/java/com/autobody/shared/exception/ResourceNotFoundException.java), [BusinessRuleException.java](autobody-api/src/main/java/com/autobody/shared/exception/BusinessRuleException.java)

**User module + auth**
- [user/User.java](autobody-api/src/main/java/com/autobody/user/User.java) + [UserRepository.java](autobody-api/src/main/java/com/autobody/user/UserRepository.java) + [UserService.java](autobody-api/src/main/java/com/autobody/user/UserService.java) + [UserMapper.java](autobody-api/src/main/java/com/autobody/user/UserMapper.java) + [UserController.java](autobody-api/src/main/java/com/autobody/user/UserController.java)
- DTOs: [LoginRequest](autobody-api/src/main/java/com/autobody/user/dto/LoginRequest.java), [LoginResponse](autobody-api/src/main/java/com/autobody/user/dto/LoginResponse.java), [RefreshRequest](autobody-api/src/main/java/com/autobody/user/dto/RefreshRequest.java), [CreateUserRequest](autobody-api/src/main/java/com/autobody/user/dto/CreateUserRequest.java), [UpdateUserRequest](autobody-api/src/main/java/com/autobody/user/dto/UpdateUserRequest.java), [UserDTO](autobody-api/src/main/java/com/autobody/user/dto/UserDTO.java)
- [user/AuthController.java](autobody-api/src/main/java/com/autobody/user/AuthController.java) — `POST /api/auth/login`, `POST /api/auth/refresh`
- [user/AdminBootstrap.java](autobody-api/src/main/java/com/autobody/user/AdminBootstrap.java) — replaces the V5 placeholder hash with a real bcrypt of `Admin@1234` on first boot
- [AutobodyApplication.java](autobody-api/src/main/java/com/autobody/AutobodyApplication.java) — main class

**Endpoints wired**
- `POST /api/auth/login` · `POST /api/auth/refresh` · `GET /api/users/me` · `GET /api/users` (ADMIN) · `POST /api/users` (ADMIN) · `PUT /api/users/{id}` (ADMIN) · `GET /api/users/{id}` (ADMIN)
- Swagger UI: `/swagger-ui.html` · OpenAPI: `/api-docs` · Health: `/actuator/health`

---

## In progress

**Phase 6 — Dashboard endpoints + Reports** (kickoff prompt step 16)
- `com.autobody.dashboard` — `GET /api/dashboard/stats` (today sales total + count, pending orders, open + escalated conversations, low stock count)
- `com.autobody.reporting` — `ReportService` + `ReportController` exposing `GET /api/reports/sales` (day/week/month buckets), `/top-parts`, `/dead-stock`, `/margin`
- `com.autobody.whatsapp.EscalationController` — list ESCALATED conversations, claim, resolve
- `com.autobody.whatsapp.BroadcastController` — `POST /api/broadcast` (ADMIN only) sends WhatsApp message via existing `WhatsAppClient`
- Repo aggregates added: `OrderRepository.salesByBucket / sumTotalBetween / countBetween / countByStatus`, `OrderItemRepository.topPartsByQty / marginByPart / lastSaleAt`, `PartRepository.countLowStock / findDeadStockSince`, `ConversationRepository.countByStatus / findByStatus`

**Phase 5 — Shopify sync** (kickoff prompt step 15)
- `com.autobody.shopify` — Shopify webhook endpoint (`/api/webhooks/shopify/orders-created`) with HMAC verification (`X-Shopify-Hmac-Sha256`)
- Shopify API client scaffold (`ShopifyClient`) + sync service (`ShopifySyncService`) for product/inventory push
- Quartz scheduled sync job (`ShopifySyncJob` + `ShopifyJobConfig`) using cron property
- Local order import on Shopify `orders/create` webhook (stores source as `SHOPIFY`)

**Phase 4 — POS + Orders + Receipts** (kickoff prompt step 14)
- `com.autobody.order` — order + order_item entities, repo, service, controller, DTOs, mapper; order create now records `StockMovement` (`SALE`) in the same transaction
- `com.autobody.pos` — pos_session entity, repo, service, controller, DTOs, mapper (open/active/close endpoints)
- Receipt PDF service (`PDFBox`) added via `ReceiptPdfService` + `GET /api/orders/{id}/receipt`

---

## Next up (in order)

1. Swap SVG placeholders on the marketing site for real 3D renders once business name + assets are provided
2. Extend integration-test coverage to the order + POS flow (stock movement atomicity)
3. Wire real-time WhatsApp inbox updates (SSE or polling) so operator takeovers don't need manual refresh

---

## Open decisions & deviations

- **Dockerfile uses `maven:3.9-eclipse-temurin-21`** instead of `./mvnw`. The kickoff prompt specified the wrapper, but its `.jar` is binary and can't be generated here. If you want the wrapper, run `mvn -N wrapper:wrapper` once locally and commit the files.
- **V5 admin seed hash is a placeholder.** `AdminBootstrap.java` detects and re-encodes it on first boot so login works immediately. Change the `Admin@1234` password after first login.
- **Quartz store is in-memory.** Fine for now. When we add real jobs (WhatsApp timeout, Shopify sync) we may need to decide JDBC vs RAM persistence based on whether we want job survival across restarts.
- **`@CreatedBy` was dropped** from `AuditableEntity` because V1 users table has no `created_by` column and most downstream tables don't either. Add back per-entity if needed.

---

## Environment to fill before running

Copy `autobody-api/.env.local.example` → `autobody-api/.env.local`. Mandatory for local:
- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (defaults match docker-compose)
- `REDIS_URL` (defaults to `redis://localhost:6379`)
- `JWT_SECRET` (>= 32 bytes)

Optional (only needed when the relevant module is built):
- `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `META_VERIFY_TOKEN`
- `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Changelog

- **2026-04-19** — Phase 1 scaffolding complete (44 files): pom, Docker, 5 migrations, config, security, shared primitives, user module + auth, AdminBootstrap.
- **2026-04-19** — Added `progress.md`; starting Phase 2 inventory module.
- **2026-04-19** — Added `com.autobody.customer` module (entity/repo/service/controller + DTOs/mapper + `CustomerSource` enum); Phase 3 started.
- **2026-04-19** — Added `com.autobody.whatsapp` scaffold (verify/receive webhook, signature guard, Redis bot state, conversation/message persistence, outbound WebClient sender).
- **2026-04-19** — Added `com.autobody.order` + `com.autobody.pos` modules (order placement with atomic stock movement, POS session open/close flow); Phase 4 started.
- **2026-04-19** — Added receipt PDF generation with PDFBox (`ReceiptPdfService`) and download endpoint `GET /api/orders/{id}/receipt`; Phase 5 (Shopify sync) is next.
- **2026-04-19** — Added Shopify sync scaffold: verified webhook endpoint, local Shopify-order import, Shopify API sync client/service, Quartz periodic sync job; Phase 6 is next.
- **2026-04-19** — Phase 6 scaffolding: `com.autobody.dashboard` (stats), `com.autobody.reporting` (sales/top-parts/dead-stock/margin), `EscalationController` (list/claim/resolve), `BroadcastController` (ADMIN). Added aggregate queries to Order, OrderItem, Part, Conversation repos. Phase 7 (Next.js dashboard) is next.
- **2026-04-20** — Phase 7 scaffold: `autobody-web` Next.js 14 (App Router, TS strict, Tailwind warm palette). Pages: `/` landing, `/login`, `/dashboard` (stat cards + 30-day sales sparkline + recent orders), `/inventory` (search + low-stock tab), `/orders` (status filter + receipt links), `/conversations`, `/escalations` (claim/resolve), `/pos` (session open/close + cart checkout), `/reports` (sales granularity + top-parts + dead-stock + margin). Lib: typed `api` client with JWT refresh, `auth` helpers, shared types. Backend addition: `ConversationController` (`GET /api/conversations`) to back the conversations list.
- **2026-04-19** — Phase 3 complete: `ConversationHandler` state machine drives `BotStep` transitions (GREETING → ASK_VEHICLE → ASK_PART → PROVIDE_STOCK → ESCALATION_OFFER → ESCALATED/DONE) with word-boundary escalation/affirmative/negative keyword detection and live part lookup via `PartRepository.search`. `WhatsAppWebhookService` refactored to delegate. Added `ConversationTimeoutService` + `ConversationTimeoutJob` (Quartz, default cron `0 0/5 * * * ?`) that flips ACTIVE conversations idle for >30 min to `TIMED_OUT`; wired through `WhatsAppJobConfig` and `ConversationRepository.markStaleAsTimedOut`.
- **2026-04-20** — Authoring forms in `autobody-web`: `/inventory/new` (full part form with supplier dropdown, year range, cost/sell pricing, low-stock threshold), `/suppliers` list + `/suppliers/new` (name, contact, lead time, notes), `/users` list + `/users/new` + `/users/[id]/edit` (role select, active toggle, optional password reset). Sidebar now includes Suppliers and Users links. Added `Select` UI primitive + `IconTruck`, `IconUsers`, `IconArrowLeft` icons. Added `Supplier` type. **Auth shape fix:** backend `LoginResponse` was returning `{token, expiresAt}` but the frontend expected `{accessToken, expiresInMs}` — login was broken on the wire. Renamed the record fields and switched to a `Duration.toMillis()` value so the cookie max-age math works. Frontend `AuthUser.fullName` → `AuthUser.name` to match `UserDTO.name`.
- **2026-04-20** — Public marketing site scaffolded under `src/app/(marketing)` with a dark midnight/steel palette and Orbitron display font. Route group has its own layout (bezel-container, nav: Home/Services/About/Contact, EN indicator, footer). Pages: Home (hero + achievements glass card), Services (numbered vertical list + top-down line-art car aside), About (two-column copy + hairline separator + chrome-wheel SVG), Contact (form + shop-info list). SVG placeholders in `components/marketing/` — `car-render.tsx` (3/4 wireframe), `car-topdown.tsx` (technical drawing), `wheel-render.tsx` (chrome alloy with spokes + tire tread). Tailwind extended with `midnight`, `steel` palettes, `display` font, `bezel`/`glass` shadows, `midnight-radial` background. Old cream/clay `app/page.tsx` removed; root now resolves to the marketing group. Business name stays placeholder until user confirms.
- **2026-04-20** — Inline edit + deactivate flows wired in dashboard. [`/inventory/[id]/edit`](autobody-web/src/app/(dashboard)/inventory/[id]/edit/page.tsx) loads part + suppliers in parallel, renders SKU/qtyOnHand readonly (stock is adjusted via movements, not this form), submits `PUT /api/parts/{id}`, and exposes `Deactivate` (soft-delete via `DELETE`, with confirm prompt) / `Reactivate` (PUT `{ active: true }`) buttons. [`/inventory`](autobody-web/src/app/(dashboard)/inventory/page.tsx) gains an "Actions" column with per-row Edit link. [`/suppliers/[id]/edit`](autobody-web/src/app/(dashboard)/suppliers/[id]/edit/page.tsx) mirrors the shape for supplier edits but uses a hard `DELETE` (Supplier has no `active` flag) with a prominent confirm warning that parts referencing the supplier must be unlinked first; backend FK errors surface inline. [`/suppliers`](autobody-web/src/app/(dashboard)/suppliers/page.tsx) also gets an Actions column with Edit link. Backend endpoints (`PUT`/`DELETE` on parts + suppliers) were already in place — this was pure frontend.
- **2026-04-20** — Test tier added (was previously empty). Pom: Testcontainers BOM 1.20.2, `junit-jupiter` + `postgresql` test scope. `application-it.properties` profile (dummy Redis URL, cache=none, Quartz auto-startup=false, blank Meta/Shopify creds). `AbstractPostgresIntegrationTest` spins up `postgres:16-alpine` via Testcontainers + `@DynamicPropertySource`; Redis-touching beans are `@MockBean`'d per-test. Tests: [`ConversationHandlerTest`](autobody-api/src/test/java/com/autobody/whatsapp/ConversationHandlerTest.java) (pure unit, Mockito `PartRepository`, covers escalation word boundaries + every BotStep transition), [`ConversationTimeoutServiceIT`](autobody-api/src/test/java/com/autobody/whatsapp/ConversationTimeoutServiceIT.java) (native UPDATE to age `updated_at`, asserts ACTIVE→TIMED_OUT and that ESCALATED/RESOLVED are left alone), [`WhatsAppWebhookServiceIT`](autobody-api/src/test/java/com/autobody/whatsapp/WhatsAppWebhookServiceIT.java) (feeds JSON payloads end-to-end through state machine, verifies DB state + INBOUND/OUTBOUND message pairs). Along the way, added `clearAutomatically = true, flushAutomatically = true` to `ConversationRepository.markStaleAsTimedOut` — the previous `@Modifying` query left the JPA first-level cache stale after bulk update, which the integration test surfaced.
