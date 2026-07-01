create table if not exists user_activity_days(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    activity_date date not null,
    created_at timestamptz not null default now(),
    unique (user_id, activity_date)
);
create index if  not exists user_activity_days_user_id_idx
on user_activity_days(user_id);

create index if not exists user_activity_days_user_id_activity_date_idx
on user_activity_days(user_id, activity_date desc);
