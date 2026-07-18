-- ============================================================
-- Shakespeare Language Center (SLC) — Level Exam Database Schema
-- Run this once in your Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste all of this → Run)
-- ============================================================

create extension if not exists pgcrypto;

-- One row per student who has started the process at least once.
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  device_id text,
  attempt_status text not null default 'not_started'
    check (attempt_status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_email on students (email);
create index if not exists idx_students_device on students (device_id);

-- Every attempt a student makes (kept even after a reset, so history is never lost).
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  time_limit_seconds integer not null default 3600,
  answers jsonb not null default '{}'::jsonb,   -- { "1": "b", "2": "a", ... } saved as the student goes
  score integer,
  total integer,
  level text check (level in ('Level Intro', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5')),
  topic_breakdown jsonb,                        -- { "Grammar - Tenses": { "correct": 3, "total": 4 }, ... }
  is_current boolean not null default true,     -- only one attempt per student is "current" at a time
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_student on attempts (student_id);

-- Generated reports (strengths/weaknesses + teaching plan), kept permanently per attempt.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  attempt_id uuid not null references attempts(id) on delete cascade,
  strengths text,
  weaknesses text,
  short_term_goals text,
  long_term_goals text,
  action_plan text,
  generated_at timestamptz not null default now()
);

create index if not exists idx_reports_student on reports (student_id);

-- ============================================================
-- Row Level Security: locked down completely.
-- All reads/writes happen only through Netlify Functions using
-- the service_role key (never exposed to the browser). The
-- anon key (used only for teacher login) has zero table access.
-- ============================================================
alter table students enable row level security;
alter table attempts enable row level security;
alter table reports enable row level security;

-- (No policies are created — with RLS on and no policies, the anon/public
-- role can access nothing. Only the service_role key, used server-side
-- inside Netlify Functions, bypasses RLS.)
