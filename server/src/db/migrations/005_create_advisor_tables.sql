create table if not exists advisor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists advisor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references advisor_conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists advisor_conversations_user_id_idx on advisor_conversations(user_id);
create index if not exists advisor_messages_conversation_id_idx on advisor_messages(conversation_id);
create index if not exists advisor_messages_user_id_idx on advisor_messages(user_id);
create index if not exists advisor_messages_created_at_idx on advisor_messages(created_at);
