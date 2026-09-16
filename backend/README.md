# Game Transactions Backend

Reusable NestJS backend for a game catalogue, Steam-authenticated players, and in-game microtransactions. It runs with fake providers locally and can switch to Steam providers through environment variables without changing Unity's API calls.

## Quick start

Requirements: Node.js, Docker Desktop, and Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose starts PostgreSQL, waits for it to be ready, applies the versioned migrations once, and then starts the API at `http://localhost:3000`. Check its health with `GET /health`.

For local development without containerising the API, start only PostgreSQL and use the host commands:

```bash
docker compose up -d postgres
npm install
npm run contract:emit
npx prisma db migrate
npm run start:dev
```

For an existing database whose contract has changed, preview and then apply the update:

```bash
npx prisma db update --dry-run
npx prisma db update
```

Never commit `.env`, Steam keys, or production database URLs.

## Public deployment

By default, only 100 requests per IP per minute are accepted; configure `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` for the expected traffic. The in-memory limiter is appropriate for this single-container Compose deployment. If a fork runs multiple API replicas, place a shared rate limiter at the reverse proxy or use a shared store.

`CORS_ORIGINS` is disabled by default because Unity does not need browser CORS. If a fork adds a browser client or admin panel, set it to its comma-separated, full origins (for example, `https://admin.example.com`), never `*`. Set `TRUST_PROXY=true` only behind a reverse proxy you control, so IP rate limiting uses the actual client IP.

## Providers

Local development defaults to `AUTH_PROVIDER=fake` and `PAYMENT_PROVIDER=fake`.

For Steam authentication set `AUTH_PROVIDER=steam`, `STEAM_APP_ID`, `STEAM_AUTH_KEY`, and `STEAM_AUTH_IDENTITY`. Unity sends a ticket to this backend; the backend validates it with Steam. The publisher key must stay on the server.

For Steam payments set `PAYMENT_PROVIDER=steam`, `STEAM_APP_ID`, and `STEAM_MICROTXN_KEY`. Keep `STEAM_MICROTXN_SANDBOX=true` until the Steamworks integration has been tested. Each product needs a numeric `steamItemId` before it can be sold through Steam.

## API flow

```text
POST /api/auth                         { ticket }
GET  /api/products
POST /api/orders                       { productId, quantity }
POST /api/orders/:id/confirm
GET  /api/inventories/me
```

All endpoints after authentication require `Authorization: Bearer <accessToken>`. Unity creates and confirms orders against this API; it never receives Steam publisher keys or sets prices/statuses itself.

## Tests

```bash
npm test                  # Unit tests
npm run test:integration  # Services + PostgreSQL in Testcontainers
npm run test:e2e          # HTTP API + PostgreSQL in Testcontainers
npm run build
```

The integration and E2E tests require Docker Desktop.
