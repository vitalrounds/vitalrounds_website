create extension if not exists pgcrypto;

create table if not exists public.partner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  organisation_legal_name text not null,
  trading_name text,
  facility_type text,
  abn_acn text,
  primary_contact_name text,
  primary_contact_role text,
  contact_phone text,
  physical_address text,
  website text,
  departments text,
  admin_notes text,
  avatar jsonb not null default '{}'::jsonb,
  status text not null default 'active'
    check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_profiles_email_idx on public.partner_profiles(lower(email));
create index if not exists partner_profiles_status_idx on public.partner_profiles(status);

insert into storage.buckets (id, name, public)
values ('partner-assets', 'partner-assets', false)
on conflict (id) do nothing;

alter table public.partner_profiles enable row level security;
