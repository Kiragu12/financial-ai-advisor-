# Deployment Shape

Akiba ships in three pieces: a static frontend on Vercel, an Express API on
Railway, and a PostgreSQL instance also on Railway. This note records what
goes where, which environment variables each piece reads, and how the
frontend reaches the backend in each environment.

## Topology

```text
Browser  ──HTTPS──▶  Vercel (client/)  ──HTTPS──▶  Railway (server/)  ──TCP──▶  Railway Postgres
```

- **Frontend** — `client/` built with `vite build`, served by Vercel as a
  static site. No server-side rendering, no Vercel Functions.
- **Backend** — `server/` Express app, deployed to Railway as a single
  service. Paul owns this; we do not edit or deploy it.
- **Database** — Managed PostgreSQL on Railway, attached to the backend
  service. Owned by Paul.

## Environment variables

### Frontend (`client/`)

| Variable | Purpose | Local | Production |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of Paul's backend. Used by `src/api/client.ts`. | empty (dev server proxies `/api` → `http://localhost:4000`) | `https://<paul-api>.up.railway.app` |

Local copy lives in `client/.env.local` (gitignored). The template is
`client/.env.example`. Only variables prefixed with `VITE_` are exposed to
the bundle — never put secrets here.

### Backend (`server/`)

Backend env vars are Paul's responsibility. The frontend only needs to know
the API base URL.

## Local development

```bash
npm install
npm run dev
```

The root `dev` script runs the backend and the client together. The Vite
dev server listens on `http://127.0.0.1:5274`. With `VITE_API_BASE_URL`
unset, requests to `/api/*` are proxied to `http://localhost:4000` (the
default backend port).

## Vercel project (frontend)

- **Framework preset**: Vite
- **Root directory**: `client/`
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variables**:
  - `VITE_API_BASE_URL` — set per environment (preview and production
    point at the matching Railway URL).

Preview deployments should point at a preview backend if one exists;
otherwise they share the production API.

## Railway project (backend + database)

Owned by Paul. Recorded here so the frontend has a single picture of the
deployment shape:

- **Web service**: Node + Express from `server/`.
- **Database**: PostgreSQL plugin attached to the web service.
- **Public URL**: this is the value of `VITE_API_BASE_URL` on Vercel.

## CORS

The backend reads `CORS_ORIGIN` from its env (see `server/src/config/env.ts`).
For each environment the value must include the matching frontend origin
— for example the Vercel production URL in production and `http://127.0.0.1:5274`
locally. If the frontend can't reach the backend in production, that's the
first thing to check.

## Pre-deploy checklist

- [ ] `npm run lint` and `npm run build` pass in `client/`.
- [ ] `npm test` passes in `client/` (once the test suite exists).
- [ ] Vercel `VITE_API_BASE_URL` matches the live Railway URL for that
      environment.
- [ ] Railway `CORS_ORIGIN` includes the corresponding Vercel origin.
- [ ] The deployed frontend can reach `GET /api/health` and renders an OK
      banner.
