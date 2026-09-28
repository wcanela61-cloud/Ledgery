-- Run this once in Supabase → SQL Editor to turn on "Delete account" (already included in schema.sql).
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
