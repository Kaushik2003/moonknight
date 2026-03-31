-- ================================================================
-- Builder Pass - Clerk Migration
-- Run this in Supabase SQL Editor after switching auth from Supabase to Clerk
-- ================================================================

create table if not exists public.builder_passes (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              text        not null,
  razorpay_order_id    text        not null,
  razorpay_payment_id  text,
  razorpay_signature   text,
  amount_paise         integer     not null default 15000,
  status               text        not null default 'created',
  expires_at           timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.builder_passes
  alter column user_id type text using user_id::text;

alter table public.builder_passes
  drop constraint if exists builder_passes_user_id_fkey;

alter table public.builder_passes enable row level security;

drop policy if exists "Users can read own passes" on public.builder_passes;

create index if not exists idx_builder_passes_user_active
  on public.builder_passes (user_id, status, expires_at desc);
