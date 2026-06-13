# Database Design

## Design Goals

- Represent student financial activity accurately.
- Preserve financial history instead of deleting records casually.
- Support multiple wallets per user.
- Support income, expenses, wallet transfers, and savings goal contributions.
- Make dashboard analytics easy to compute.
- Give the AI advisor reliable context.
- Enforce ownership and relational integrity.

## Core Entities

The first version should include these tables:

- `users`
- `wallets`
- `categories`
- `transactions`
- `transfers`
- `savings_goals`
- `goal_contributions`
- `advisor_conversations`
- `advisor_messages`

## Table Drafts

### users

Stores authenticated student accounts.

Suggested columns:

```text
id uuid primary key
full_name varchar not null
email varchar not null unique
password_hash varchar not null
preferred_currency varchar not null default 'KES'
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Email must be unique.
- Passwords are never stored directly.
- User deletion should be handled carefully because other tables depend on the user.

### wallets

Stores money containers such as cash, M-PESA, bank, or custom wallets.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
name varchar not null
type varchar not null
currency varchar not null default 'KES'
opening_balance numeric(14,2) not null default 0
current_balance numeric(14,2) not null default 0
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Wallet belongs to one user.
- Wallet type should be constrained to known values such as `cash`, `mobile_money`, `bank`, and `custom`.
- Wallets should be deactivated rather than deleted after they have transactions.
- `current_balance` is acceptable for this project if all balance changes are controlled through services and database transactions.

Architecture note:

- A pure ledger model derives wallet balance from transaction sums. It is theoretically cleaner but can make early development slower.
- For this student project, storing `current_balance` is pragmatic if we enforce all mutations through transaction-safe services and test balance behavior.

### categories

Stores transaction categories.

Suggested columns:

```text
id uuid primary key
user_id uuid references users(id)
name varchar not null
type varchar not null
color varchar
icon varchar
is_default boolean not null default false
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Default categories may have `user_id` as null.
- Custom categories belong to one user.
- Category type should be `income` or `expense`.
- A user should not have duplicate category names for the same type.

Default expense categories:

- Food
- Rent
- Transport
- Academic
- Airtime and Data
- Entertainment
- Health
- Personal Care
- Other

Default income categories:

- Allowance
- Scholarship
- Part-Time Work
- Gift
- Refund
- Other

### transactions

Stores income and expense entries, plus transfer-linked entries where useful.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
wallet_id uuid not null references wallets(id)
category_id uuid references categories(id)
type varchar not null
amount numeric(14,2) not null
description text
transaction_date date not null
transfer_id uuid references transfers(id)
created_at timestamptz not null
updated_at timestamptz not null
deleted_at timestamptz
```

Rules:

- Type should be `income`, `expense`, `transfer_in`, or `transfer_out`.
- Amount must be greater than zero.
- Expense and transfer-out reduce wallet balance.
- Income and transfer-in increase wallet balance.
- Soft delete is safer than hard delete because financial history affects analytics.
- If a transaction references a wallet, that wallet must belong to the same user.

### transfers

Stores wallet-to-wallet movement metadata.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
from_wallet_id uuid not null references wallets(id)
to_wallet_id uuid not null references wallets(id)
amount numeric(14,2) not null
description text
transfer_date date not null
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Source and destination wallets must be different.
- Both wallets must belong to the same user.
- Amount must be greater than zero.
- Transfer should create two linked transaction rows:
  - `transfer_out` on source wallet.
  - `transfer_in` on destination wallet.
- Transfer operation must run inside one database transaction.

### savings_goals

Stores target-based savings plans.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
name varchar not null
target_amount numeric(14,2) not null
current_amount numeric(14,2) not null default 0
deadline date
status varchar not null default 'active'
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Target amount must be greater than zero.
- Current amount cannot be negative.
- Status should be `active`, `completed`, `paused`, or `cancelled`.
- Completion can be computed when `current_amount >= target_amount`.

### goal_contributions

Stores progress movements into savings goals.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
goal_id uuid not null references savings_goals(id)
wallet_id uuid references wallets(id)
amount numeric(14,2) not null
contribution_date date not null
note text
created_at timestamptz not null
```

Rules:

- Amount must be greater than zero.
- Goal must belong to the same user.
- Wallet, when present, must belong to the same user.
- If contributions are meant to remove spendable money from a wallet, they should also create an expense-like transaction or dedicated movement record.

Open decision:

- For version one, we need to decide whether a goal contribution deducts from a wallet balance.
- Recommendation: yes, if the goal represents money set aside. This keeps wallet balances honest.

### advisor_conversations

Stores AI advisor chat sessions. A conversation lets the student continue a financial discussion without starting from scratch each time.

Suggested columns:

```text
id uuid primary key
user_id uuid not null references users(id)
title varchar
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Conversation belongs to one user.
- Title can be generated from the first user question or left blank initially.
- Conversations should remain available so users can revisit previous advice.

### advisor_messages

Stores user and assistant messages. These messages create the advisor's memory inside our system.

Suggested columns:

```text
id uuid primary key
conversation_id uuid not null references advisor_conversations(id)
role varchar not null
content text not null
context_snapshot jsonb
model varchar
created_at timestamptz not null
```

Rules:

- Role should be `user`, `assistant`, or `system`.
- `context_snapshot` is useful for explaining what financial context was used when advice was generated.
- Do not store secrets or API keys.
- The AI provider does not permanently remember the user; the backend creates continuity by sending selected recent messages and current financial context with each request.
- We should not send all historical messages on every AI request. The backend should select a useful recent window and combine it with a fresh financial summary.

## Advisor Memory Strategy

The advisor should support continuity across time. This means the user can return to a previous conversation and the system can understand what advice was given before.

Recommended version-one behavior:

- Store every user and assistant message.
- Store a `context_snapshot` for assistant responses so we know what financial summary influenced the advice.
- When a user asks a follow-up question, send the AI:
  - the system safety instructions,
  - the user's current wallet and goal summary,
  - recent spending/category summaries,
  - the last several messages in the selected conversation,
  - the new question.
- Keep the full history in our database, but send only the most relevant recent messages to the AI.

Why this matters:

- Users do not have to explain their situation from the beginning every time.
- The advisor can refer to previous suggestions and adjust future guidance.
- The project can evaluate whether earlier advice matched later user behavior.
- We can audit, debug, and improve the advisor prompt over time.
- It supports a more realistic coaching experience instead of isolated one-off answers.

Future improvement:

- Add structured advice tracking, where important recommendations are extracted into a table and later compared with user behavior.
- Example: if the advisor recommends reducing food spending by KES 1,500, the system can later compare food spending before and after that advice.

## Key Relationships

```text
users 1 -> many wallets
users 1 -> many categories
users 1 -> many transactions
users 1 -> many transfers
users 1 -> many savings_goals
users 1 -> many advisor_conversations

wallets 1 -> many transactions
categories 1 -> many transactions
transfers 1 -> many transactions
savings_goals 1 -> many goal_contributions
advisor_conversations 1 -> many advisor_messages
```

## Balance Strategy

Recommended for version one:

- Store `wallets.current_balance`.
- Update it only inside backend services.
- Wrap all balance-affecting writes in database transactions.
- Test every balance-affecting use case.

Why this is best for this project:

- It makes dashboard reads simple.
- It is easier to explain and implement within project time.
- It still remains correct if service boundaries and tests are strict.

Future improvement:

- Move to a full ledger model where balances are derived from immutable entries.

## Indexes

Recommended indexes:

```text
users(email)
wallets(user_id)
wallets(user_id, is_active)
categories(user_id, type)
transactions(user_id, transaction_date)
transactions(wallet_id, transaction_date)
transactions(category_id)
transfers(user_id, transfer_date)
savings_goals(user_id, status)
goal_contributions(goal_id)
advisor_conversations(user_id, updated_at)
advisor_messages(conversation_id, created_at)
```

## Data Integrity Rules

- All authenticated queries must be scoped by `user_id`.
- Backend must never trust IDs from the client without ownership checks.
- Amounts use `numeric(14,2)`, not floating point.
- Destructive actions should prefer soft deletion for financial history.
- API validation and database constraints should both exist for important rules.
- AI advisor context should be generated from database queries, not client-provided summaries.

## First Migration Order

1. Enable UUID support if needed.
2. Create `users`.
3. Create `wallets`.
4. Create `categories`.
5. Seed default categories.
6. Create `transfers`.
7. Create `transactions`.
8. Create `savings_goals`.
9. Create `goal_contributions`.
10. Create `advisor_conversations`.
11. Create `advisor_messages`.
