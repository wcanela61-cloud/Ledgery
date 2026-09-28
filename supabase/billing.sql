-- Ledgery subscriptions (Stripe Billing). Run this once in Supabase → SQL Editor
-- (already included in schema.sql). One row per person: their Stripe customer and
-- the state of their subscription, kept up to date by the stripe-webhook function.
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text        not null unique,
  stripe_subscription_id text,
  status                 text,        -- trialing | active | past_due | canceled | unpaid | incomplete | paused …
  price_id               text,
  billing_interval       text,        -- month | year
  trial_end              timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     not null default false,
  trial_used             boolean     not null default false, -- one free trial per person
  updated_at             timestamptz not null default now()
);

-- Row-level security: people can read their own row. Only the Edge Functions
-- (which use the service role) can write, so nobody can grant themselves a plan.
alter table public.subscriptions enable row level security;

drop policy if exists "Read own subscription" on public.subscriptions;
create policy "Read own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
