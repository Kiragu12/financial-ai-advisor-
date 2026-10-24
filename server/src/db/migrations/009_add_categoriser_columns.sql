alter table transactions
    add column if not exists predicted_category_id uuid references categories(id),
    add column if not exists prediction_confidence numeric(4,3),
    add column if not exists user_corrected boolean not null default false;

create index if not exists transactions_corrected_idx
on transactions(user_corrected) where user_corrected = true;
