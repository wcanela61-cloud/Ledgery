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


-- Photos: one row per photo (a small JPEG as a data URL), so they sync between devices.
create table if not exists public.photos (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id         text        not null,
  data       text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.photos enable row level security;

drop policy if exists "Read own photos"   on public.photos;
drop policy if exists "Insert own photos" on public.photos;
drop policy if exists "Update own photos" on public.photos;
drop policy if exists "Delete own photos" on public.photos;

create policy "Read own photos"   on public.photos for select to authenticated using (auth.uid() = user_id);
create policy "Insert own photos" on public.photos for insert to authenticated with check (auth.uid() = user_id);
create policy "Update own photos" on public.photos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own photos" on public.photos for delete to authenticated using (auth.uid() = user_id);

-- Delete account: lets a signed-in person remove their own login. Their ledger and
-- photos go with it (on delete cascade). Used by Settings → Account → Delete account.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
