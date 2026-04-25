# autobody-api

Spring Boot 3.3 + Java 21 backend for the Autobody Automation System.

## Local run

Prereqs: Java 21, Maven 3.9+, Docker Desktop.

```bash
# 1. Copy env template
cp .env.local.example .env.local

# 2. Start Postgres + Redis
docker compose up -d

# 3. Build + run
mvn spring-boot:run
```

The app listens on `http://localhost:8080`. Default profile: `local`.

## Smoke tests (Phase 1)

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/api-docs
- **Health:** http://localhost:8080/actuator/health

### Login with the seeded admin

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autobody.local","password":"Admin@1234"}'
```

Expect `200 OK` with `{ success: true, data: { token, refreshToken, expiresAt, user } }`.

On first boot, `AdminBootstrap` replaces the placeholder bcrypt hash from
`V5__seed_admin_user.sql` with a real hash of `Admin@1234`. **Change this password
immediately after first login** via `PUT /api/users/{id}` (role ADMIN).

### Call an authenticated endpoint

```bash
TOKEN=...  # from /login response
curl http://localhost:8080/api/users/me -H "Authorization: Bearer $TOKEN"
```

## Project layout

```
src/main/java/com/autobody/
├── AutobodyApplication.java
├── config/            ← Security, Redis, Quartz, Async, OpenAPI
├── security/          ← Role, JwtService, JwtAuthFilter, principal
├── shared/            ← ApiResponse, PagedResponse, exceptions, audit
└── user/              ← User entity/repo/service + AuthController + AdminBootstrap
```

Future modules (inventory, customer, whatsapp, pos, shopify, dashboard, reporting)
will land under the same `com.autobody.<module>` convention — see the kickoff prompt.

## Build for production

```bash
mvn -DskipTests package
# or
docker build -t autobody-api:dev .
```
