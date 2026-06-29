# Voyara

Voyara is a dark-themed group travel platform: organize shared trips, share a social travel feed, request to join groups, and generate custom itineraries via Gemini.

- **Frontend:** React 19 + Vite + Tailwind 4 (in `frontend/`)
- **Backend:** Spring Boot 3 + JPA + Spring Security + JWT (in `backend/`)
- **Database:** Postgres for dev and prod (Flyway migrations); H2 only for the test suite
- **AI:** Server-side Gemini calls via `@google/genai` (frontend never sees the API key)

## Quick start (local dev)

```bash
# Terminal 1: Postgres (one-time per session)
docker compose up -d postgres

# Terminal 2: backend on :8080 (Postgres + Flyway + seeded demo users)
npm run dev:backend

# Terminal 3: Vite on :3000 (proxies /api to the backend)
npm run dev
```

Open http://localhost:3000.

Inspect the database directly:

```bash
docker exec -it voyara-postgres psql -U voyara -d voyara
# inside psql: \dt   to list tables
```

Wipe and re-seed:

```bash
docker compose down -v && docker compose up -d postgres
```

**Seeded demo users** (dev profile only):

| email                       | password              |
|-----------------------------|-----------------------|
| `srinathn.2212@gmail.com`   | `voyara-demo-account` |
| `amelia@voyara.com`         | `voyara-demo-account` |
| `rohit@voyara.com`          | `voyara-demo-account` |
| `alice@voyara.com`          | `voyara-demo-account` |

## Production deploy

```bash
cp .env.example .env
# Edit .env: set VOYARA_JWT_SECRET (>= 32 chars), POSTGRES_PASSWORD, GEMINI_API_KEY
docker-compose -f docker-compose.prod.yml up -d --build
```

The frontend is served on port 80; the backend is reachable only through the frontend nginx proxy. Postgres data persists in a docker volume.

## Tests

```bash
npm run test:backend     # 9 integration tests covering the auth flow
```

## Layout

```
backend/                   Spring Boot (com.voyara.*)
  src/main/java/com/voyara/
    controller/            REST endpoints (Auth, Post, Trip, Request, AI)
    entity/                JPA entities
    repository/            Spring Data repos
    dto/                   Request/response DTOs (UserResponse hides password)
    security/              JWT, cookie, rate limiter, security config
    service/               GeminiService
    web/                   GlobalExceptionHandler
    config/                DataSeeder (dev profile only)
  src/main/resources/
    application.properties           shared defaults
    application-dev.properties       H2, ddl-auto=update, seed data
    application-test.properties      isolated H2, no seed
    application-prod.properties      Postgres + Flyway, secure cookie
    db/migration/V1__init_schema.sql Flyway initial schema for prod
  src/test/java/com/voyara/AuthFlowIntegrationTest.java
  Dockerfile

frontend/                  Vite + React (no SSR; nginx serves static in prod)
  src/
    App.jsx                cookie auth, no localStorage tokens
    components/            LandingView, AuthView, HomeFeedView, TripsView, AIPlannerView, ProfileView, Navbar
  Dockerfile
  nginx.conf

docker-compose.yml         Postgres only (for local dev when running backend in JVM)
docker-compose.prod.yml    Full stack (backend + frontend + Postgres)
.github/workflows/ci.yml   Build, test, Docker image build on push/PR
```

## Security model

- Passwords hashed with BCrypt.
- Auth tokens are HS256 JWTs, delivered in an `HttpOnly` cookie (`voyara_session`) with `SameSite=Lax`. `Secure` is enabled by default in the prod profile.
- `/api/auth/login` is rate-limited (10 attempts/min per IP+email).
- Login responses never include the password field (DTO layer).
- CORS is pinned to the allowed origin via `VOYARA_CORS_ORIGINS`.
- Spring Security filter chain protects every endpoint except: `POST /api/auth/{login,register,logout}`, `GET /api/auth/me`, `GET /api/posts*`, `GET /api/trips*`, `/actuator/health`, `/actuator/info`.

## Environment variables

See [`.env.example`](./.env.example) for the full list.
