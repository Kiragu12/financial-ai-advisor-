-- Per-user monthly spending budgets for expense categories.
-- One budget per (user, category); the amount is a recurring monthly limit.
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create index if not exists budgets_user_id_idx on budgets(user_id);
create index if not exists budgets_category_id_idx on budgets(category_id);
