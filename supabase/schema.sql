-- Ledgery accounts: one row per person holding their ledger (items, sales,
-- fee rates, monthly goal) as JSON. Run this once in Supabase → SQL Editor.

create table if not exists public.ledgers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  version    bigint      not null default 1,   -- bumped on every save; stops two devices overwriting each other
  updated_at timestamptz not null default now()
);

-- Row-level security: each signed-in person can only see and change their own row.
alter table public.ledgers enable row level security;

drop policy if exists "Read own ledger"   on public.ledgers;
drop policy if exists "Insert own ledger" on public.ledgers;
drop policy if exists "Update own ledger" on public.ledgers;
drop policy if exists "Delete own ledger" on public.ledgers;

create policy "Read own ledger"   on public.ledgers for select to authenticated using (auth.uid() = user_id);
create policy "Insert own ledger" on public.ledgers for insert to authenticated with check (auth.uid() = user_id);
create policy "Update own ledger" on public.ledgers for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own ledger" on public.ledgers for delete to authenticated using (auth.uid() = user_id);
