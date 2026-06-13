create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0 check (current_amount >= 0),
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  goal_id uuid not null references savings_goals(id) on delete cascade,
  wallet_id uuid references wallets(id),
  amount numeric(14, 2) not null check (amount > 0),
  contribution_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_user_id_idx on savings_goals(user_id);
create index if not exists savings_goals_status_idx on savings_goals(status);
create index if not exists goal_contributions_user_id_idx on goal_contributions(user_id);
create index if not exists goal_contributions_goal_id_idx on goal_contributions(goal_id);
create index if not exists goal_contributions_wallet_id_idx on goal_contributions(wallet_id);
