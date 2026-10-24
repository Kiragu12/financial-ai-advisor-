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
- [x] Add database migration tooling. (`server/src/db/migrate.ts`, `npm run migrate`; tracks applied files in `schema_migrations`.)
- [x] Add README setup instructions.

### Phase 2: Authentication Vertical Slice

- [x] Implement user registration.
- [x] Implement login and logout.
- [x] Hash passwords securely with bcryptjs.
- [x] Protect backend routes with auth middleware using JWT in HTTP-only cookies.
- [x] Protect frontend routes with auth state.
- [x] Verify auth backend with manual smoke tests.
- [x] Wire frontend login/register forms to backend auth endpoints. (`use-auth.ts` → Login.tsx, Register.tsx, AuthContext, Topbar — verified.)

### Phase 3: Wallet Management

- [x] Create wallet model and migrations.
- [x] Implement create, list, update, deactivate wallet APIs.
- [x] Build wallet screens in the frontend as backend-ready empty states.
- [x] Ensure wallet balances are stored consistently.
- [x] Test wallet ownership and validation rules.
- [x] Wire wallet frontend screens to backend wallet APIs. (`use-wallets.ts` → Wallets.tsx, Add/EditWalletDialog — verified.)

### Phase 4: Transaction Management

- [x] Create transaction and category models.
- [x] Implement income and expense logging.
- [x] Implement category assignment with type validation.
- [x] Implement wallet balance impact rules atomically.
- [x] Build transaction entry and history screens as backend-ready empty states.
- [x] Test transaction validation, ownership, balance math, rollback, and soft-delete reversal.
- [x] Wire transaction frontend screens to backend transaction APIs.
- [x] Implement transaction edit flow (PATCH /api/transactions/:id): atomic balance re-adjustment — same-wallet net change, or deadlock-safe dual-wallet move when the wallet changes; category/type validation; transfer-leg + negative-balance guards. Verified live. Frontend: EditTransactionDialog + per-row edit button.

### Phase 5: Wallet Transfers

- [x] Model transfers as atomic paired movements between wallets.
- [x] Enforce sufficient funds where needed.
- [x] Implement transfer API.
- [x] Build transfer frontend flow as a backend-ready modal.
- [x] Test rollback behavior and balance consistency.
- [x] Wire transfer frontend flow to backend transfer API. (`use-transfers.ts` → TransferDialog, mounted in Transactions.tsx — verified.)
- [ ] Decide whether transfer reversal/delete is in scope.

### Phase 6: Savings Goals (backend done)

- [x] Create savings goal model (goals module: types, schemas, repository, service, controller, routes).
- [x] Implement goal creation, progress tracking, updates, and completion status (auto-completes when a contribution reaches target).
- [x] Implement contributions, optionally drawn from a wallet (atomic: locks goal + wallet, writes an expense transaction for balance integrity, debits wallet, updates goal — all in one DB transaction).
- [x] Build savings goal screens as backend-ready empty states.
- [x] Wire goal frontend screens to backend goal APIs. (`use-goals.ts` → Goals.tsx, AddGoalDialog, ContributeDialog — verified.)
- [x] Test progress calculations and validation rules (progress %, completion, insufficient funds rollback, paused/completed guards, target-below-saved guard, cross-user 404 all verified live).
- Endpoints: GET/POST /api/goals, GET/PATCH /api/goals/:id, GET/POST /api/goals/:id/contributions.

### Phase 7: Dashboard and Analytics (backend done)

- [x] Aggregate total balances across wallets (dashboard module: types, schemas, repository, service, controller, routes).
- [x] Compute spending by category (date-ranged; null-category rows shown as "Uncategorized"; percentages of period total).
- [x] Compute income versus expense trends (monthly cashflow; transfers excluded as internal movements).
- [x] Show savings progress summaries (active/completed counts, total saved vs target).
- [x] Build responsive dashboard UI as backend-ready empty states.
- [x] Wire dashboard screens to backend dashboard APIs. (`use-dashboard.ts` → Dashboard.tsx — verified.)
- [x] Test analytics queries against known seed data (balance/income/expense/net/category %/cashflow all hand-verified; empty account returns zeros not nulls; bad query params rejected; cross-user scoped; 401 unauth).
- Endpoints: GET /api/dashboard/summary, GET /api/dashboard/spending-by-category, GET /api/dashboard/cashflow.

### Phase 8: AI Financial Advisor (self-hosted — no external API)

The advisor was originally built on a third-party LLM API. For Deliverable 2 it
was rebuilt to be fully self-contained: every model is trained or written by the
team, the server makes no outbound calls, and every reply traces to a rule and a
number. This addresses the proposal's own Limitation 3 (third-party LLM
dependency). See Phases 11–12 and `tasks/deliverable-2-plan.md`.

- [x] Store conversations and messages (advisor module: types, schemas, repository, context, client, service, controller, routes).
- [x] Build a structured financial snapshot from existing aggregations (`advisor.context.ts` — dashboard, goals, budgets, wallets; no new SQL).
- [x] Safety boundaries: not-a-licensed-advisor disclaimer appended whenever a reply touches loans, debt or investment; figures only ever come from the user's own data.
- [x] Remove the LLM dependency (`@anthropic-ai/sdk` and all `ANTHROPIC_*`/`DEEPSEEK_*` config deleted; no "not configured" path remains).
- [x] Wire advisor chat screen to backend advisor APIs. (`use-advisor.ts` → Advisor.tsx — verified.)
- [x] Unit-test the reply router — one example per branch, disclaimer, phrasing variation (`advisor.client.test.ts`).
- [ ] Live end-to-end test through the chat UI against a running server (data / advice / general question, then with networking disabled).
- Endpoints: GET/POST /api/advisor/conversations, GET /api/advisor/conversations/:id, POST /api/advisor/conversations/:id/messages.

### Phase 9: Quality, Security, and Deployment (backend hardening done)

- [x] Security review: auth (JWT httpOnly cookie, bcrypt 12), ownership (every query user_id-scoped), secrets (.env gitignored + untracked, verified), input validation (Zod + parameterised SQL), AI data handling (no secrets in advisor context).
- [x] Add rate limiting: global per-IP ceiling, tight login/register limit (brute-force), per-minute advisor cap. Auth limiter verified live (11th failed login → 429; health unaffected).
- [x] Hardening: helmet, CORS locked to explicit origin, 100KB JSON body limit, trust proxy in production, graceful SIGTERM/SIGINT shutdown (closes HTTP server + pg pool).
- [x] Production config guard: env.ts fails fast if CORS_ORIGIN is localhost in production.
- [x] Prepare production environment variables (documented in server/README.md with required/optional table).
- [x] Production build verified (npm run build → dist/server.js).
- [x] Deployment guide written (server/README.md: Railway/Render/Fly build+start+healthcheck+migrate steps; DB stays on Supabase).
- [ ] Deploy frontend to Vercel. (frontend owner)
- [ ] Deploy backend to Railway/Render and run migrations (including 009) against prod DB. (Paul — when ready; needs prod CORS_ORIGIN + secrets)
- [ ] Verify the deployed system end to end. (after deploy)

### Phase 10: Documentation and Final Submission Support

- [x] Maintain architecture notes and diagrams.
- [x] Document deployment shape.
- [ ] Prepare testing evidence.
- [ ] Align implementation with dissertation deliverables.
- [ ] Final review against proposal scope.

### Phase 11: Transaction Categorisation Model

- [x] ML workspace `ml/` (offline only, never deployed): generate → train → export pipeline, pinned requirements, README.
- [x] Seed `ml/lexicon.json` with the plan's starter keywords for the nine seeded expense categories.
- [ ] **Expand the lexicon by hand to 40–60 keywords per category** (team task — the model's quality rests on this), then rerun `generate.py` → `train.py` → `export.py`.
- [x] `generate.py` — bootstrap training set from the lexicon (seeded, balanced, keyword column for grouped CV).
- [x] `extract.py` — M-Pesa PDF → anonymised `to_label.csv` (phones, receipt refs, long numbers and private names masked).
- [ ] **Label ~250 real M-Pesa rows into `ml/data/test_real.csv`**; both labellers label the same 60-row overlap and run `agreement.py`.
- [x] `train.py` — baseline vs Count+NB vs TF-IDF+LogReg; NB alpha tuned by GroupKFold CV on train only; refuses to report without the real test set.
- [ ] Final `train.py` run on the real hold-out set → `ml/out/metrics.json`, `confusion_matrix.csv` (current model.json is a dev build from the seed lexicon).
- [x] `export.py` → `server/src/modules/categoriser/model.json` + sklearn parity fixture.
- [x] TypeScript inference (`categoriser.model.ts`) — pure NB scoring, no dependency; unknown merchants capped below the auto-assign threshold.
- [x] Shared tokeniser `categoriser/text.ts` (also used by advisor knowledge-base retrieval).
- [x] `POST /api/categoriser/suggest` — resolves predicted name to the user's own category, then the default.
- [x] Parity test: TypeScript probabilities match scikit-learn's on 25 rows.
- [x] Migration `009_add_categoriser_columns.sql` — predicted_category_id, prediction_confidence, user_corrected.
- [ ] **Apply migration 009** (`npm run migrate`) — required before the new transaction code runs.
- [x] Correction capture: `user_corrected` set on create and on later re-categorisation.
- [x] Suggestion UI in AddTransactionDialog: confident → preselected with "Suggested — change if wrong"; uncertain → top-3 chips; failure → nothing.

### Phase 12: Self-Hosted Advisor Engine

- [x] Insight engine `advisor/insights/` — rules R1–R9 (spike, dominance, negative net, low savings, goal pace, budget breach, uncategorised, positive, no-data), ranked by score; baseline is the user's own history.
- [x] Unit test per rule — one triggering and one non-triggering case each.
- [x] Knowledge base `advisor/kb/knowledge-base.json` (49 entries, Kenyan student context) + TF-IDF retrieval with a 0.25 similarity floor.
- [x] Retrieval tests — on-topic hits and off-topic nulls.
- [x] Router + templates: data → snapshot figures; advice → findings (or topic answer + personal finding for strong topic matches); general → knowledge base → top finding → capabilities.
- [ ] Evidence pack in `docs/evidence/`: metrics, confusion matrix, rule-coverage table, demo recordings (incl. offline demo).

### Extensions beyond the approved proposal

`budgets` and `gamification` (streaks/activity) are built and wired but are not in
the approved proposal's §3.6 list. They are extensions: budgets also feed advisor
rule R6 (budget breach).

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
- 2026-10-24 — Deliverable 2: removed the external LLM; added the Naive Bayes categoriser (`ml/` + `categoriser` module), the rule-based insight engine, the knowledge base and the in-process reply router. Server test suite added (Vitest, 80 tests). Tracker audited against the code: frontend wiring for auth, wallets, transfers, goals, dashboard and advisor verified and ticked. Outstanding: expand the lexicon, label the real test set, apply migration 009, retrain, evidence pack. The 10 pre-existing client test failures (outdated "backend not ready" assertions) still need updating.
