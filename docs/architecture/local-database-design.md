# Local Database Design

## Purpose

This document defines the local PostgreSQL schema for Akiba Finance Tracker.
The same design should remain compatible with Supabase later because Supabase
uses PostgreSQL underneath.

## Design Rules

1. Every private record belongs to one user.
2. Users can have many wallets.
3. A normal transaction affects exactly one wallet.
4. A transfer affects two wallets and creates two linked transaction rows.
5. Wallet balances are stored in `wallets.current_balance`.
6. Only backend services update wallet balances.
7. Important financial records should be preserved instead of hard-deleted.
8. The backend owns all financial correctness rules.

## Tables Overview

Identity:

- `users`
- `sessions`

Finance foundation:

- `wallets`
- `categories`

Money movement:

- `transactions`
- `transfers`

Savings:

- `savings_goals`
- `goal_contributions`

Advisor:

- `advisor_conversations`
- `advisor_messages`

## users

Stores the main user account and profile data.

Columns:

```text
id uuid primary key
full_name text not null
email text not null unique
password_hash text not null
preferred_currency text not null default 'KES'
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Email must be unique.
- Passwords are never stored directly.
- `password_hash` stores the hashed password.
- Default currency is `KES`.

Owned by:

- `users` module
- `auth` module uses it during registration and login

## sessions

Stores active login sessions for custom backend authentication.

Columns:

```text
id uuid primary key
user_id uuid not null
token_hash text not null unique
expires_at timestamptz not null
created_at timestamptz not null
revoked_at timestamptz
```

Rules:

- The frontend receives the raw session token.
- The database stores only a hash of the token.
- A session is invalid if `revoked_at` is set.
- A session is invalid after `expires_at`.

Owned by:

- `auth` module

## wallets

Stores user money containers such as Cash, M-Pesa, Bank, Savings, or custom wallets.

Columns:

```text
id uuid primary key
user_id uuid not null
name text not null
type text not null
currency text not null default 'KES'
opening_balance numeric(14,2) not null default 0
current_balance numeric(14,2) not null default 0
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Wallet belongs to one user.
- Wallet type is one of `cash`, `mobile_money`, `bank`, `savings`, or `custom`.
- Wallets with financial history should be deactivated instead of deleted.
- `current_balance` is changed only by backend services.

Owned by:

- `wallets` module

## categories

Stores income and expense categories.

Columns:

```text
id uuid primary key
user_id uuid
name text not null
type text not null
color text
icon text
is_default boolean not null default false
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Category type is `income` or `expense`.
- Default categories have `user_id = null`.
- Custom categories belong to one user.
- A user should not have duplicate category names for the same type.

Owned by:

- `categories` module

## transactions

Stores individual money movements. Each row affects one wallet.

Columns:

```text
id uuid primary key
user_id uuid not null
wallet_id uuid not null
category_id uuid
type text not null
amount numeric(14,2) not null
description text
transaction_date date not null
transfer_id uuid
created_at timestamptz not null
updated_at timestamptz not null
deleted_at timestamptz
```

Transaction types:

```text
income
expense
transfer_in
transfer_out
```

Rules:

- A transaction affects exactly one wallet.
- Amount must be greater than zero.
- `income` increases wallet balance.
- `expense` decreases wallet balance.
- `transfer_in` increases wallet balance.
- `transfer_out` decreases wallet balance.
- Deleted transactions use `deleted_at`.
- Wallet, category, and transaction user ownership must match.

Owned by:

- `transactions` module

## transfers

Stores wallet-to-wallet transfer metadata. A transfer creates two linked
transaction rows.

Example:

```text
Transfer KES 500 from M-Pesa to Cash

transfers:
  from_wallet_id = M-Pesa
  to_wallet_id = Cash
  amount = 500

transactions:
  transfer_out, wallet_id = M-Pesa, amount = 500
  transfer_in, wallet_id = Cash, amount = 500
```

Columns:

```text
id uuid primary key
user_id uuid not null
from_wallet_id uuid not null
to_wallet_id uuid not null
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
- Transfer creation must run inside one database transaction.
- If one side fails, the whole transfer fails.

Owned by:

- `transfers` module
- also writes linked rows through the `transactions` model

## savings_goals

Stores user savings targets.

Columns:

```text
id uuid primary key
user_id uuid not null
name text not null
target_amount numeric(14,2) not null
current_amount numeric(14,2) not null default 0
deadline date
status text not null default 'active'
created_at timestamptz not null
updated_at timestamptz not null
```

Statuses:

```text
active
completed
paused
cancelled
```

Rules:

- Goal belongs to one user.
- Target amount must be greater than zero.
- Current amount cannot be negative.
- Goal is completed when `current_amount >= target_amount`.

Owned by:

- `goals` module

## goal_contributions

Stores money added toward a savings goal.

Columns:

```text
id uuid primary key
user_id uuid not null
goal_id uuid not null
wallet_id uuid
amount numeric(14,2) not null
contribution_date date not null
note text
created_at timestamptz not null
```

Rules:

- Contribution belongs to one user.
- Contribution belongs to one goal.
- Contribution can optionally come from a wallet.
- Amount must be greater than zero.
- If it comes from a wallet, the backend reduces that wallet balance.
- Contribution increases `savings_goals.current_amount`.

Owned by:

- `goals` module

## advisor_conversations

Stores AI advisor chat conversations.

Columns:

```text
id uuid primary key
user_id uuid not null
title text not null
created_at timestamptz not null
updated_at timestamptz not null
```

Rules:

- Conversation belongs to one user.
- Title can be generated from the first user message later.

Owned by:

- `advisor` module

## advisor_messages

Stores messages in an AI advisor conversation.

Columns:

```text
id uuid primary key
conversation_id uuid not null
user_id uuid not null
role text not null
content text not null
created_at timestamptz not null
```

Roles:

```text
user
assistant
system
```

Rules:

- Message belongs to one conversation.
- Message belongs to one user.
- Assistant advice must be based on stored finance summaries.
- The advisor should not provide regulated investment, tax, or legal advice.

Owned by:

- `advisor` module

## Balance Strategy

Wallet balances are stored in `wallets.current_balance`.

Balance update rules:

```text
income:
  wallet.current_balance += amount

expense:
  wallet.current_balance -= amount

transfer_out:
  from_wallet.current_balance -= amount

transfer_in:
  to_wallet.current_balance += amount

goal contribution from wallet:
  wallet.current_balance -= amount
  goal.current_amount += amount
```

The frontend never updates balances directly.

## Backend Module Ownership

```text
auth:
  sessions, login, register, logout

users:
  users profile data

wallets:
  wallets

categories:
  categories

transactions:
  transactions

transfers:
  transfers plus linked transaction rows

goals:
  savings_goals and goal_contributions

dashboard:
  reads wallets, transactions, and goals

advisor:
  advisor_conversations and advisor_messages
```
