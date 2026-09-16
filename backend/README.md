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

Never commit `.env`, Steam keys, or production database URLs. `JWT_SECRET` must be at least 32 characters. PostgreSQL is bound to `127.0.0.1` so it is reachable from the host for local development but not exposed to the network.

## Creating a fork for a game

This repository is the reusable base. Create a fork before adding game-specific products, Steamworks credentials, domains, or deployment infrastructure.

1. Copy `.env.example` to `.env` and replace every placeholder secret. Do not reuse the base project's database or JWT secret.
2. Start the stack with `docker compose up --build`. PostgreSQL and the API are ready when `GET /health` returns `{ "status": "ok" }`.
3. Load the fork's catalogue through a private seed/admin script or a database migration. The public API intentionally exposes products as read-only. A product needs `name`, `type`, `priceInCents`, and `currency`; add its numeric `steamItemId` before enabling Steam payments.
4. Keep `AUTH_PROVIDER=fake` and `PAYMENT_PROVIDER=fake` while developing. Unity's API contract does not change when a fork switches providers.
5. When the fork is ready for Steam Sandbox, set its own `STEAM_APP_ID`, `STEAM_AUTH_KEY`, `STEAM_AUTH_IDENTITY`, and `STEAM_MICROTXN_KEY`. These credentials belong only in that fork's deployment secrets.
6. Before public hosting, set the fork's `CORS_ORIGINS` if it has browser clients, configure its proxy setting, and use an appropriate rate limit.

For any schema change, emit the contract and create a new migration; never edit an applied migration. Preview existing-database changes with `npx prisma db update --dry-run` before applying them.

## Public deployment

By default, only 100 requests per IP per minute are accepted; configure `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` for the expected traffic. The in-memory limiter is appropriate for this single-container Compose deployment. If a fork runs multiple API replicas, place a shared rate limiter at the reverse proxy or use a shared store.

`CORS_ORIGINS` is disabled by default because Unity does not need browser CORS. If a fork adds a browser client or admin panel, set it to its comma-separated, full origins (for example, `https://admin.example.com`), never `*`. Set `TRUST_PROXY=true` only behind a reverse proxy you control, so IP rate limiting uses the actual client IP.

## Providers

Local development defaults to `AUTH_PROVIDER=fake` and `PAYMENT_PROVIDER=fake`.

For Steam authentication set `AUTH_PROVIDER=steam`, `STEAM_APP_ID`, `STEAM_AUTH_KEY`, and `STEAM_AUTH_IDENTITY`. Unity sends a ticket to this backend; the backend validates it with Steam. The publisher key must stay on the server.

For Steam payments set `PAYMENT_PROVIDER=steam`, `STEAM_APP_ID`, and `STEAM_MICROTXN_KEY`. Keep `STEAM_MICROTXN_SANDBOX=true` until the Steamworks integration has been tested. Each product needs a numeric `steamItemId` before it can be sold through Steam.

## API flow

```text
Unity                         Steam                         Backend
 |                              |                              |
 |-- GetAuthSessionTicket() --->|                              |
 |-- POST /api/auth {ticket} ---------------------------------->| validate ticket
 |<------------------------------ JWT -------------------------|
 |-- GET /api/products ---------------------------------------->|
 |<------------------------------ catalogue -------------------|
 |-- POST /api/orders {productId, quantity} ------------------->| creates the order
 |<------------------------------ 201 + order id --------------|
 |                              |<-----------------------------| InitTxn
 |<-- Steam overlay; player authorises ------------------------|
 |<-- Steamworks callback: transaction authorised -------------|
 |-- POST /api/orders/:id/confirm ----------------------------->| FinalizeTxn + grant item
 |<------------------------------ paid order ------------------|
 |-- GET /api/inventories/me ---------------------------------->|
```

For the Steam providers, Unity must include the Steamworks SDK. It uses `GetAuthSessionTicket()` to obtain the authentication ticket and Steam's microtransaction/overlay flow to let the player authorise the purchase. Steamworks delivers the authorisation callback to the Unity game client, not directly to this backend. The ticket is sent to `POST /api/auth`; it is not a password and the Steam publisher keys never leave the backend.

`POST /api/orders` is the endpoint that **creates the order**. Unity sends only `productId` and `quantity`; the backend obtains the price and Steam item data from its own catalogue, so the client cannot choose a price or mark an order as paid. Its `201` response includes the order id, which Unity retains. `POST /api/orders/:id/confirm` is called only after Unity has received Steamworks' authorisation callback for that order. It does not trust Unity's claim: the backend calls Steam's `FinalizeTxn` and grants the item only if Steam accepts it. Calling confirmation again is safe and does not grant the item twice.

All endpoints after authentication require `Authorization: Bearer <accessToken>`. With the fake providers, the same endpoint sequence is used, which lets Unity keep its integration unchanged when the fork switches to Steam.

## Tests

```bash
npm test                  # Unit tests
npm run test:integration  # Services + PostgreSQL in Testcontainers
npm run test:e2e          # HTTP API + PostgreSQL in Testcontainers
npm run build
```

The integration and E2E tests require Docker Desktop.
