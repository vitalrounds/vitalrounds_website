-- Run in Supabase SQL Editor (project owner).
-- Stores wait list JSON + uploaded file metadata. Service role from Vercel inserts/reads; RLS blocks direct anon access.
create extension if not exists pgcrypto;

create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  applicant_email text,
  payload jsonb not null default '{}'::jsonb,
  file_names jsonb,
  files jsonb
);

alter table public.waitlist_submissions
  add column if not exists file_names jsonb;

alter table public.waitlist_submissions
  add column if not exists files jsonb;

create index if not exists waitlist_submissions_created_at_idx
  on public.waitlist_submissions (created_at desc);

alter table public.waitlist_submissions enable row level security;

-- Private bucket for wait list attachments.
insert into storage.buckets (id, name, public)
values ('waitlist-documents', 'waitlist-documents', false)
on conflict (id) do update set public = excluded.public;

-- No SELECT/INSERT policies for anon/authenticated:
-- only the service role (used by your API after validation) bypasses RLS.

comment on table public.waitlist_submissions is 'Wait list form submissions and file metadata; rows inserted via Next.js API using SUPABASE_SERVICE_ROLE_KEY';
