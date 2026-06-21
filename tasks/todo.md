# Workflow Reference

Use this checklist before starting non-trivial tasks in this repository.

## Workflow Orchestration

### Plan Mode Default

- Enter plan mode for any non-trivial task with 3+ steps or architectural decisions.
- If something goes sideways, stop and re-plan immediately.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### Subagent Strategy

- Use subagents liberally to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, use additional focused subagents.
- Assign one task per subagent for focused execution.

### Self-Improvement Loop

- After any correction from the user, update `tasks/lessons.md` with the pattern.
- Write rules that prevent the same mistake from recurring.
- Iterate on these lessons until the mistake rate drops.
- Review relevant lessons at the start of each session.

### Verification Before Done

- Never mark a task complete without proving it works.
- Diff behavior between main and local changes when relevant.
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, and demonstrate correctness.

### Demand Elegance

- For non-trivial changes, pause and ask: "Is there a more elegant way?"
- If a fix feels hacky, rework it into the clean solution.
- Skip this for simple, obvious fixes.
- Challenge the work before presenting it.

### Autonomous Bug Fixing

- When given a bug report, find the root cause and fix it.
- Use logs, errors, and failing tests to guide the work.
- Avoid unnecessary context switching for the user.
- Fix failing CI tests without needing hand-holding.

## Task Management

- Plan first: write the plan here with checkable items.
- Before starting a meaningful task, explain what will be done and why, then proceed.
- Verify the plan before implementation when the task is non-trivial.
- Track progress by marking items complete as work proceeds.
- Explain changes at a high level during each step.
- Document results in a review section before finishing.
- Capture lessons in `tasks/lessons.md` after user corrections.

## Current Task

- [x] Pull latest remote changes while preserving local backend work.
- [ ] Resolve remaining pull/stash conflicts and verify the merged app.

## Project Roadmap

### Phase 0: Product and Architecture Foundation

- [x] Confirm core user stories and module boundaries from the proposal.
- [x] Design the database schema for users, wallets, categories, transactions, transfers, savings goals, conversations, and advisor messages.
- [x] Decide the backend architecture: routes, controllers, services, repositories, middleware, validation, error handling, and auth strategy.
- [x] Decide the frontend architecture: pages, layouts, feature folders, API client, form handling, shared UI components, and route protection.
- [x] Draft the initial class diagram.
- [x] Review uploaded Akiba sample frontend direction.
- [x] Define environment variables, deployment shape, and local development setup.
- [ ] Review proposed wallet balance strategy before implementation.
- [ ] Review and refine UML diagrams before implementation.

### Phase 1: Project Scaffold

- [x] Create the React frontend with Tailwind CSS.
- [x] Create the Express backend.
- [x] Add linting, formatting, and consistent scripts.
- [x] Add basic tests.
- [ ] Add database migration tooling.
- [x] Add README setup instructions.

### Phase 2: Authentication Vertical Slice

- [x] Implement user registration.
- [x] Implement login and logout.
- [x] Hash passwords securely with bcryptjs.
- [x] Protect backend routes with auth middleware using JWT in HTTP-only cookies.
- [x] Protect frontend routes with auth state.
- [x] Verify auth backend with manual smoke tests.
- [ ] Wire frontend login/register forms to backend auth endpoints.

### Phase 3: Wallet Management

- [x] Create wallet model and migrations.
- [x] Implement create, list, update, deactivate wallet APIs.
- [x] Build wallet screens in the frontend as backend-ready empty states.
- [x] Ensure wallet balances are stored consistently.
- [x] Test wallet ownership and validation rules.
- [ ] Wire wallet frontend screens to backend wallet APIs.

### Phase 4: Transaction Management

- [x] Create transaction and category models.
- [x] Implement income and expense logging.
- [x] Implement category assignment with type validation.
- [x] Implement wallet balance impact rules atomically.
- [x] Build transaction entry and history screens as backend-ready empty states.
- [x] Test transaction validation, ownership, balance math, rollback, and soft-delete reversal.
- [ ] Wire transaction frontend screens to backend transaction APIs.
- [ ] Implement transaction edit flow in a later sprint.

### Phase 5: Wallet Transfers

- [x] Model transfers as atomic paired movements between wallets.
- [x] Enforce sufficient funds where needed.
- [x] Implement transfer API.
- [x] Build transfer frontend flow as a backend-ready modal.
- [x] Test rollback behavior and balance consistency.
- [ ] Wire transfer frontend flow to backend transfer API.
- [ ] Decide whether transfer reversal/delete is in scope.

### Phase 6: Savings Goals (backend done)

- [x] Create savings goal model (goals module: types, schemas, repository, service, controller, routes).
- [x] Implement goal creation, progress tracking, updates, and completion status (auto-completes when a contribution reaches target).
- [x] Implement contributions, optionally drawn from a wallet (atomic: locks goal + wallet, writes an expense transaction for balance integrity, debits wallet, updates goal — all in one DB transaction).
- [x] Build savings goal screens as backend-ready empty states.
- [ ] Wire goal frontend screens to backend goal APIs. (frontend owner)
- [x] Test progress calculations and validation rules (progress %, completion, insufficient funds rollback, paused/completed guards, target-below-saved guard, cross-user 404 all verified live).
- Endpoints: GET/POST /api/goals, GET/PATCH /api/goals/:id, GET/POST /api/goals/:id/contributions.

### Phase 7: Dashboard and Analytics (backend done)

- [x] Aggregate total balances across wallets (dashboard module: types, schemas, repository, service, controller, routes).
- [x] Compute spending by category (date-ranged; null-category rows shown as "Uncategorized"; percentages of period total).
- [x] Compute income versus expense trends (monthly cashflow; transfers excluded as internal movements).
- [x] Show savings progress summaries (active/completed counts, total saved vs target).
- [x] Build responsive dashboard UI as backend-ready empty states.
- [ ] Wire dashboard screens to backend dashboard APIs. (frontend owner)
- [x] Test analytics queries against known seed data (balance/income/expense/net/category %/cashflow all hand-verified; empty account returns zeros not nulls; bad query params rejected; cross-user scoped; 401 unauth).
- Endpoints: GET /api/dashboard/summary, GET /api/dashboard/spending-by-category, GET /api/dashboard/cashflow.

### Phase 8: AI Financial Advisor (backend done)

- [x] Store conversations and messages (advisor module: types, schemas, repository, context, client, service, controller, routes).
- [x] Build a context builder from recent transactions, category summaries, wallet balances, and savings goals (advisor.context.ts, reuses dashboard aggregations).
- [x] Add advisor safety boundaries and disclaimers for non-regulated guidance (Akiba persona in advisor.client.ts: KES, student-focused, not-a-licensed-advisor disclaimer).
- [x] Integrate the Claude API behind a backend service (advisor.client.ts — only file touching @anthropic-ai/sdk; model via ANTHROPIC_MODEL env, default claude-opus-4-8, adaptive thinking).
- [x] Build the advisor chat interface as a backend-ready empty state.
- [ ] Wire advisor chat screen to backend advisor APIs. (frontend owner)
- [x] Test prompt construction, error handling, response persistence (CRUD, cross-user 404, 401, empty-message 400, graceful "not configured" 400 with no orphan message all verified; atomic persist-after-reply confirmed).
- [ ] Live end-to-end test pending an ANTHROPIC_API_KEY in server/.env (then verify a real reply + persistence).
- Endpoints: GET/POST /api/advisor/conversations, GET /api/advisor/conversations/:id, POST /api/advisor/conversations/:id/messages.
- Notes: ANTHROPIC_API_KEY optional (server boots without it); non-streaming v1 (streaming a future enhancement); rate-limit handling relies on SDK auto-retry.

### Phase 9: Quality, Security, and Deployment (backend hardening done)

- [x] Security review: auth (JWT httpOnly cookie, bcrypt 12), ownership (every query user_id-scoped), secrets (.env gitignored + untracked, verified), input validation (Zod + parameterised SQL), AI data handling (no secrets in advisor context).
- [x] Add rate limiting: global per-IP ceiling, tight login/register limit (brute-force), per-minute advisor cap (API-cost abuse). Auth limiter verified live (11th failed login → 429; health unaffected).
- [x] Hardening: helmet, CORS locked to explicit origin, 100KB JSON body limit, trust proxy in production, graceful SIGTERM/SIGINT shutdown (closes HTTP server + pg pool).
- [x] Production config guard: env.ts fails fast if CORS_ORIGIN is localhost in production.
- [x] Prepare production environment variables (documented in server/README.md with required/optional table).
- [x] Production build verified (npm run build → dist/server.js).
- [x] Deployment guide written (server/README.md: Railway/Render/Fly build+start+healthcheck+migrate steps; DB stays on Supabase).
- [ ] Deploy frontend to Vercel. (frontend owner)
- [ ] Deploy backend to Railway/Render and run migrations against prod DB. (Paul — when ready; needs prod CORS_ORIGIN + secrets)
- [ ] Verify the deployed system end to end. (after deploy)
- [ ] Live AI advisor end-to-end test still pending an ANTHROPIC_API_KEY (carried from Phase 8).

### Phase 10: Documentation and Final Submission Support

- [x] Maintain architecture notes and diagrams.
- [x] Document deployment shape.
- [ ] Prepare testing evidence.
- [ ] Align implementation with dissertation deliverables.
- [ ] Final review against proposal scope.

## Review

- Added this repository-level workflow checklist so future tasks can reference it before implementation.
- Started the full project roadmap for the personal finance tracker and AI advisor system.
- Added architecture documents in `docs/architecture/`.
- Added the initial class diagram in `docs/architecture/class-diagram.md`.
- Reviewed the uploaded Akiba frontend prototype and captured notes in `docs/frontend/akiba-sample-review.md`.
- Scaffolded the TypeScript monorepo foundation with React/Vite/Tailwind client and Express/TypeScript server.
- Pulled latest `origin/main` on 2026-06-20 and merged the remote frontend progress with local backend progress.
- Remote frontend progress includes app shell, auth screens, protected routes, dashboard, wallets, transactions, goals, advisor UI skeletons, finance UI primitives, tests, and deployment docs.
- Local backend progress includes auth, categories, wallets, transactions, transfers, migrations, JWT/password helpers, validation middleware, ownership checks, and database helpers.
