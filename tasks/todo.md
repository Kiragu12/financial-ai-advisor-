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

### Phase 6: Savings Goals

- [ ] Create savings goal model.
- [ ] Implement goal creation, progress tracking, updates, and completion status.
- [x] Build savings goal screens as backend-ready empty states.
- [ ] Test progress calculations and validation rules.

### Phase 7: Dashboard and Analytics

- [ ] Aggregate total balances across wallets.
- [ ] Compute spending by category.
- [ ] Compute income versus expense trends.
- [ ] Show savings progress summaries.
- [x] Build responsive dashboard UI as backend-ready empty states.
- [ ] Test analytics queries against known seed data.

### Phase 8: AI Financial Advisor

- [ ] Store conversations and messages.
- [ ] Build a context builder from recent transactions, category summaries, wallet balances, and savings goals.
- [ ] Add advisor safety boundaries and disclaimers for non-regulated guidance.
- [ ] Integrate the Claude API behind a backend service.
- [x] Build the advisor chat interface as a backend-ready empty state.
- [ ] Test prompt construction, error handling, rate-limit handling, and response persistence.

### Phase 9: Quality, Security, and Deployment

- [ ] Add end-to-end checks for the main user flows.
- [ ] Review security risks: auth, ownership checks, secrets, input validation, and AI data handling.
- [ ] Prepare production environment variables.
- [ ] Deploy frontend to Vercel.
- [ ] Deploy backend and PostgreSQL to Railway.
- [ ] Verify the deployed system end to end.

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
