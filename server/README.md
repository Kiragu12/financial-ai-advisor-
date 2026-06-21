# Akiba — Backend API

Personal finance tracker with an AI advisor, for Kenyan university students.
Express 5 + TypeScript (ESM), PostgreSQL (Supabase), custom JWT auth.

## Architecture

4-layer modules under `src/modules/<name>/`:

```
routes → controller → service → repository
```

- **routes** — HTTP wiring, auth + validation middleware
- **controller** — request/response shaping only (no business logic)
- **service** — business rules; owns DB transactions for money operations
- **repository** — the only place that runs SQL (every query scoped by `user_id`)

Shared infra: `src/shared/` (errors, password, jwt, validators), `src/middleware/`
(error handler, validation, auth, rate limiting), `src/db/` (pool + migrations),
`src/config/env.ts` (validated environment).

Modules: `auth`, `wallets`, `categories`, `transactions`, `transfers`, `goals`,
`dashboard`, `advisor`, `health`.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the values
npm run migrate        # apply database migrations
npm run dev            # start with hot reload on PORT (default 4000)
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run the build),
`npm run typecheck`, `npm run lint`.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | no | `development` \| `test` \| `production` (default `development`) |
| `PORT` | no | default `4000` |
| `CORS_ORIGIN` | no | frontend URL; in production it must **not** be localhost |
| `DATABASE_URL` | **yes** | Supabase session-mode pooler URI (port 5432) |
| `JWT_SECRET` | **yes** | ≥ 32 random chars (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | no | default `7d` |
| `COOKIE_NAME` | no | default `akiba_token` |
| `ANTHROPIC_API_KEY` | no* | required only for the AI advisor; server boots without it |
| `ANTHROPIC_MODEL` | no | default `claude-opus-4-8`; use `claude-sonnet-4-6` / `claude-haiku-4-5` for lower cost |

Secrets live **only** in `.env` (gitignored). Never commit real values.

## Security posture

- **Auth** — stateless JWT in an HTTP-only, `sameSite=lax` cookie (`secure` in production). Passwords hashed with bcrypt (12 rounds).
- **Ownership** — every repository query is filtered by `user_id` in SQL; cross-user access returns 404.
- **Input validation** — Zod schemas on every body/param; parameterised SQL throughout (no string interpolation).
- **Rate limiting** — global per-IP ceiling; tight limit on login/register (brute-force); per-minute cap on advisor messages (API-cost abuse).
- **Hardening** — `helmet` headers, CORS locked to an explicit origin with credentials, 100 KB JSON body limit, generic 500s (real errors logged server-side only), `trust proxy` in production.
- **Money integrity** — every balance change is atomic (`withTransaction` + `SELECT … FOR UPDATE`), with multi-wallet locks acquired in sorted order to avoid deadlocks.

## Deployment (Railway / Render / Fly)

The database is hosted on Supabase, so only the API needs a host.

1. **Build command:** `npm install && npm run build`
2. **Start command:** `npm start` (runs `node dist/server.js`)
3. **Health check path:** `/api/health` (returns 200, mounted before rate limiting)
4. **Environment:** set all required vars above, with `NODE_ENV=production` and
   `CORS_ORIGIN` = the deployed frontend URL.
5. **Migrations:** run `npm run migrate` once against the production database
   (as a release/deploy step or manually).

The server handles `SIGTERM`/`SIGINT` for graceful shutdown (drains in-flight
requests, closes the DB pool) so platform redeploys don't drop connections.
