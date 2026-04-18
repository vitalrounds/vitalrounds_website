-- Run once in Supabase SQL Editor (project owner).
-- Stores wait list JSON + file name hints. Service role from Vercel inserts; RLS blocks direct anon access.

create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  applicant_email text,
  payload jsonb not null default '{}'::jsonb,
  file_names jsonb
);

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);

alter table public.waitlist_submissions enable row level security;

-- No SELECT/INSERT policies for anon/authenticated: only the service role (used by your API after validation) bypasses RLS.

comment on table public.waitlist_submissions is 'Wait list form submissions; rows inserted only via Next.js API using SUPABASE_SERVICE_ROLE_KEY';
