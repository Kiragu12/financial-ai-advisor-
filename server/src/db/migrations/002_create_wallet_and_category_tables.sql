create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('cash', 'mobile_money', 'bank', 'savings', 'custom')),
  currency text not null default 'KES',
  opening_balance numeric(14, 2) not null default 0 check (opening_balance >= 0),
  current_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text,
  icon text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_default_name_type_idx
  on categories(name, type)
  where user_id is null;

create unique index if not exists categories_user_name_type_idx
  on categories(user_id, lower(name), type)
  where user_id is not null;

create index if not exists wallets_user_id_idx on wallets(user_id);
create index if not exists categories_user_id_idx on categories(user_id);
