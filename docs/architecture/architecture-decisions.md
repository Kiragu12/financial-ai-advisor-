# Architecture Decisions

This file records important project decisions so we can keep the system coherent as it grows.

## ADR-001: Start With Architecture Before Code

Status: Accepted

Date: 2026-05-31

### Context

The project is a financial application with an AI advisor. The system depends on trustworthy user data, correct wallet balances, atomic transfers, useful analytics, and safe AI context construction.

Starting directly with login screens or isolated UI work would produce visible progress but could lead to poor module boundaries, weak data modeling, and later rework.

### Decision

We will define the architecture and database design before writing application code.

The first design artifacts are:

- `docs/architecture/system-architecture.md`
- `docs/architecture/database-design.md`
- `docs/architecture/architecture-decisions.md`

### Consequences

Benefits:

- Clear module boundaries before implementation.
- Better database decisions before financial data exists.
- Easier implementation sequence.
- Better alignment with the proposal and dissertation.
- Less rework when building dashboard analytics and AI advisor context.

Costs:

- Slower visible progress at the beginning.
- Requires discipline to keep the architecture practical instead of theoretical.

## ADR-002: Build Using Vertical Slices After Foundation

Status: Accepted

Date: 2026-05-31

### Context

The system contains several connected modules: auth, wallets, transactions, transfers, goals, dashboard analytics, and AI advisor. Building one layer entirely before another can hide integration problems until late.

### Decision

After architecture and project scaffold, we will build complete vertical slices. Each slice should include database changes, backend API, frontend screens where relevant, and verification.

Initial slice order:

1. Authentication.
2. Wallets.
3. Transactions.
4. Transfers.
5. Savings goals.
6. Dashboard.
7. AI advisor.

### Consequences

Benefits:

- Each milestone produces working software.
- Integration issues are found early.
- Testing stays tied to real workflows.
- Supervisor feedback can be incorporated incrementally.

Costs:

- Requires careful migration planning.
- Some shared UI/API helpers may evolve as we learn.

## ADR-003: Store Wallet Current Balance With Strict Service Controls

Status: Proposed

Date: 2026-05-31

### Context

Wallet balances can be handled in two main ways:

- Derive balances from immutable ledger entries.
- Store `current_balance` on the wallet and update it during financial operations.

A pure ledger model is more robust for large financial systems, but it adds complexity. This project has limited time and needs clear deliverables.

### Decision

For version one, we propose storing `wallets.current_balance`, updated only by backend services inside database transactions.

### Consequences

Benefits:

- Simpler dashboard queries.
- Easier implementation and explanation.
- Faster project progress.

Risks:

- Bugs in balance-update services could create inconsistencies.

Mitigations:

- No direct wallet balance updates from controllers.
- Balance-affecting operations must be tested.
- Transfers must use database transactions.
- Later, we can add reconciliation checks comparing stored balances against transaction history.

## ADR-004: Store Advisor Conversation History in Our Database

Status: Accepted

Date: 2026-05-31

### Context

The AI advisor should feel like a continuous financial coaching experience, not a one-off question answering tool. Students may ask for advice, try to follow it, then return later to ask whether they improved or what to do next.

The AI provider does not own durable memory for our application. If we want continuity, auditability, and learning from past advice, our system must store the conversation history.

### Decision

We will store advisor conversations and messages in PostgreSQL.

For each AI request, the backend will build a fresh prompt using:

- current financial summaries,
- active savings goals,
- recent spending patterns,
- selected recent messages from the conversation,
- the user's new question.

The backend will not send the user's entire lifetime chat history on every request.

### Consequences

Benefits:

- Users can revisit previous advice.
- The advisor can continue a conversation naturally.
- We can audit what advice was given and what data informed it.
- We can later compare advice against user behavior to see whether it helped.
- The dissertation can discuss advisor continuity and evaluation more convincingly.

Costs:

- We must protect advisor messages as private user data.
- We must manage prompt size and avoid sending too much history.
- We need clear retention and deletion behavior later.

Future improvement:

- Add structured recommendation tracking so the system can evaluate whether advice was followed and whether the user's financial behavior improved.
