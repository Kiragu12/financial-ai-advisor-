# Akiba Finance Tracker

Akiba is a web-based personal finance tracker with an AI-powered financial advisor for university students.

## Design

The Claude Design for the frontend is here:
<https://api.anthropic.com/v1/design/h/0n8ctC-sB8TEcB5P59oX8Q>

## Project Structure

```text
client/   React + TypeScript frontend
server/   Express + TypeScript backend
docs/     Architecture and design notes
tasks/    Project workflow and roadmap
```

## Local Development

Install dependencies:

```bash
npm install
```

Run both frontend and backend:

```bash
npm run dev
```

Run only the backend:

```bash
npm run dev:server
```

Run only the frontend:

```bash
npm run dev:client
```

## First Health Check

The backend exposes:

```text
GET /api/health
```

The frontend calls this endpoint from the app shell to prove the client and server can communicate.

## Environment Variables

Copy `client/.env.example` to `client/.env.local` and adjust if needed. The
only variable the frontend reads is `VITE_API_BASE_URL` — see the comments
in that file for the values used in each environment.

## Deployment

See [`docs/deployment.md`](docs/deployment.md) for the production shape
(Vercel for the frontend, Railway for the backend and PostgreSQL), the
env vars each piece reads, and the pre-deploy checklist.
