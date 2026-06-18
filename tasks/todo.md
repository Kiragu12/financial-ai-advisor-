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

- [x] Agree on the full project build roadmap and first implementation milestone.
- [ ] Review and approve the architecture documents before scaffolding code.

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
- [x] Add backend health endpoint and frontend health check.

### Phase 2: Authentication Vertical Slice

- [ ] Implement user registration.
- [ ] Implement login and logout.
- [ ] Hash passwords securely.
- [ ] Protect backend routes with auth middleware.
- [x] Protect frontend routes with auth state.
- [ ] Verify auth with automated tests and manual browser checks.

### Phase 3: Wallet Management

- [ ] Create wallet model and migrations.
- [ ] Implement create, list, update, deactivate wallet APIs.
- [ ] Build wallet screens in the frontend.
- [ ] Ensure wallet balances are derived or updated consistently.
- [ ] Test wallet ownership and validation rules.

### Phase 4: Transaction Management

- [ ] Create transaction and category models.
- [ ] Implement income and expense logging.
- [ ] Implement category assignment.
- [ ] Implement wallet balance impact rules.
- [ ] Build transaction entry and history screens.
- [ ] Test transaction validation and wallet ownership.

### Phase 5: Wallet Transfers

- [ ] Model transfers as atomic paired movements between wallets.
- [ ] Enforce sufficient funds where needed.
- [ ] Implement transfer API and frontend flow.
- [ ] Test rollback behavior and balance consistency.

### Phase 6: Savings Goals

- [ ] Create savings goal model.
- [ ] Implement goal creation, progress tracking, updates, and completion status.
- [ ] Build savings goal screens.
- [ ] Test progress calculations and validation rules.

### Phase 7: Dashboard and Analytics

- [ ] Aggregate total balances across wallets.
- [ ] Compute spending by category.
- [ ] Compute income versus expense trends.
- [ ] Show savings progress summaries.
- [ ] Build responsive dashboard UI.
- [ ] Test analytics queries against known seed data.

### Phase 8: AI Financial Advisor

- [ ] Store conversations and messages.
- [ ] Build a context builder from recent transactions, category summaries, wallet balances, and savings goals.
- [ ] Add advisor safety boundaries and disclaimers for non-regulated guidance.
- [ ] Integrate the Claude API behind a backend service.
- [ ] Build the advisor chat interface.
- [ ] Test prompt construction, error handling, rate-limit handling, and response persistence.

### Phase 9: Quality, Security, and Deployment

- [ ] Add end-to-end checks for the main user flows.
- [ ] Review security risks: auth, ownership checks, secrets, input validation, and AI data handling.
- [ ] Prepare production environment variables.
- [ ] Deploy frontend to Vercel.
- [ ] Deploy backend and PostgreSQL to Railway.
- [ ] Verify the deployed system end to end.

### Phase 10: Documentation and Final Submission Support

- [ ] Maintain architecture notes and diagrams.
- [ ] Document setup, usage, and deployment.
- [ ] Prepare testing evidence.
- [ ] Align implementation with dissertation deliverables.
- [ ] Final review against proposal scope.

## Review

- Added this repository-level workflow checklist so future tasks can reference it before implementation.
- Started the full project roadmap for the personal finance tracker and AI advisor system.
- Added initial architecture documents:
  - `docs/architecture/system-architecture.md`
  - `docs/architecture/database-design.md`
  - `docs/architecture/architecture-decisions.md`
- Added the initial class diagram in `docs/architecture/class-diagram.md`.
- Reviewed the uploaded Akiba frontend prototype and captured notes in `docs/frontend/akiba-sample-review.md`.
- Scaffolded the TypeScript monorepo foundation:
  - React + Vite + Tailwind client in `client/`
  - Express + TypeScript server in `server/`
  - `GET /api/health` backend endpoint
  - frontend health-status check against the API
  - local frontend port set to `http://127.0.0.1:5274` to avoid existing Vite port conflicts
- Phase 3.5 — Auth UI shells (unwired, honest about backend gap):
  - `components/layout/AuthShell.tsx` — centred-card shell with brand mark, no sidebar.
  - `pages/Login.tsx` and `pages/Register.tsx` — real forms built on existing primitives, HTML5 validation, mutual links between the two.
  - On submit, an info Alert explains the relevant `POST /api/auth/*` endpoint isn't live yet. No faked session.
  - Routes wired at `/login` and `/register`; Landing CTAs now reach real screens. `npm run lint` and `npm run build` green.
- Phase 3 — App shell + routes:
  - `components/layout/AppShell.tsx` with a desktop sidebar, sticky topbar, and mobile slide-over.
  - `components/layout/Sidebar.tsx`, `Topbar.tsx`, `PageHeader.tsx` built on existing UI primitives.
  - Stub pages for `/dashboard`, `/wallets`, `/transactions`, `/goals`, `/advisor`, each rendering the real PageHeader plus an honest "waiting on the backend" Alert (no fake data).
  - Routes nested under AppShell in `app/App.tsx`; Landing, Sandbox and NotReady kept outside.
  - `npm run lint` and `npm run build` green; dev server already serving 200 on every new route.
- Phase 2 FE — auth context + protected routes (frontend half of the auth slice):
  - `features/auth/AuthContext.tsx` provides `token`, `isAuthenticated`, `signIn(token)`, `signOut()`, backed by `localStorage` under `akiba.auth.token`. Honest about Paul's API: no user payload invented, no fake login flow.
  - `features/auth/useAuth.ts` exposes the typed hook (split out so React Fast Refresh stays clean).
  - `features/auth/ProtectedRoute.tsx` redirects unauthenticated visitors to `/login` and preserves the originating path in router state.
  - `app/App.tsx` wraps the AppShell-nested routes in `ProtectedRoute` and the whole tree in `AuthProvider`. `/dashboard`, `/wallets`, `/transactions`, `/goals`, `/advisor` are gated.
  - `Topbar.tsx`'s "Log out" item now calls `signOut()` (local-only — clears the stored token, the ProtectedRoute bounces back to `/login`).
  - Login form unchanged: still surfaces the honest "backend not ready" alert. When Paul ships `POST /api/auth/login`, wiring is one call to `signIn(response.token)` away.
- Phase 1 — frontend test tooling:
  - Vitest + jsdom + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` installed.
  - `vite.config.ts` extended with a Vitest `test` config; `src/test/setup.ts` wires jest-dom matchers and per-test cleanup.
  - `npm test` and `npm run test:watch` scripts added.
  - Smoke tests cover Landing (hero + CTAs), Login (honest backend-not-ready alert, register link) and ProtectedRoute (redirect-when-unauthenticated, render-when-authenticated). 5/5 passing.
- Phase 0 — environment + deployment shape:
  - `client/.env.example` documents `VITE_API_BASE_URL` with the local and Railway values.
  - `docs/deployment.md` records the production shape: Vercel for the frontend, Railway for the backend and PostgreSQL, env vars each piece reads, and a pre-deploy checklist.
  - README updated with an Environment Variables section and a pointer to the deployment doc.
- Phase 4–8 FE — full UI skeletons (every protected screen, no fake data):
  - `components/finance/` primitives: `EmptyState`, `BackendNotReady`, `StatCard`, `WalletCard`, `TransactionRow`, `GoalCard`, `MoneyInput` (string-typed, decimal-only, KES prefix — never coerced to Number).
  - `pages/Dashboard.tsx`: KPI strip (aggregate balance, income, spending), recent activity, spending categories, goals progress and advisor teaser sections — each rendering its empty state until the dashboard summary endpoint ships.
  - `pages/Wallets.tsx` + `features/wallets/AddWalletDialog.tsx`: wallets grid empty state, aggregate balance / active wallets / updated stat strip, Add Wallet modal with name + type + opening-balance fields and honest backend-not-ready alert on submit.
  - `pages/Transactions.tsx` + `features/transactions/AddTransactionDialog.tsx` + `features/transfers/TransferDialog.tsx`: search + wallet/range filters, monthly income/spending stat cards, Add Transaction modal (income/expense toggle, MoneyInput, wallet/category pickers disabled until those endpoints exist, date, note), Transfer modal (from/to pickers disabled, MoneyInput, note). Submit on each surfaces the matching POST endpoint as not-ready.
  - `pages/Goals.tsx` + `features/goals/AddGoalDialog.tsx`: total-saved / active / completed stat strip, empty grid, Add Goal modal (name, MoneyInput target, deadline, optional initial contribution).
  - `pages/Advisor.tsx`: chat shell (Card with header, scrolling body, textarea + Send button), empty conversation state, proactive-insights rail empty state, and a top-of-page "educational, not regulated financial advice" disclaimer. Send surfaces the advisor endpoint as not-ready.
  - Tests added for Dashboard, Advisor, AddWalletDialog, AddTransactionDialog and AddGoalDialog (validation + backend-not-ready paths). 11/11 passing. Lint and build green.
  - Important: every data slot is an empty/error state, every submit is an honest "backend not ready" alert. Zero hardcoded balances, transactions, goals or chat messages. When Paul ships an endpoint, each section becomes a one-line query/mutation wire-up.
