create extension if not exists pgcrypto;

create table if not exists public.applicant_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'pending_email_verification'
    check (status in ('pending_email_verification', 'active', 'disabled')),
  survey jsonb not null default '{}'::jsonb,
  details jsonb not null default '{}'::jsonb,
  documents jsonb not null default '{}'::jsonb,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applicant_profiles_status_idx on public.applicant_profiles(status);
create index if not exists applicant_profiles_email_idx on public.applicant_profiles(lower(email));

create table if not exists public.program_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists program_applications_applicant_idx
  on public.program_applications(applicant_user_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('applicant-documents', 'applicant-documents', false)
on conflict (id) do nothing;

alter table public.applicant_profiles enable row level security;
alter table public.program_applications enable row level security;
