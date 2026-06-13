create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  from_wallet_id uuid not null references wallets(id),
  to_wallet_id uuid not null references wallets(id),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  transfer_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_wallet_id <> to_wallet_id)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  wallet_id uuid not null references wallets(id),
  category_id uuid references categories(id),
  type text not null check (type in ('income', 'expense', 'transfer_in', 'transfer_out')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  transaction_date date not null,
  transfer_id uuid references transfers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists transfers_user_id_idx on transfers(user_id);
create index if not exists transfers_from_wallet_id_idx on transfers(from_wallet_id);
create index if not exists transfers_to_wallet_id_idx on transfers(to_wallet_id);

create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_wallet_id_idx on transactions(wallet_id);
create index if not exists transactions_category_id_idx on transactions(category_id);
create index if not exists transactions_transfer_id_idx on transactions(transfer_id);
create index if not exists transactions_transaction_date_idx on transactions(transaction_date);
create index if not exists transactions_active_idx on transactions(user_id, transaction_date)
  where deleted_at is null;
