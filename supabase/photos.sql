-- Run this once in Supabase → SQL Editor to turn on photo sync (already included in schema.sql).

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
