-- Run this in the Supabase SQL editor.
-- Frontdesk — Marina Physio schema + seed data
-- Today's reference date: 2026-06-12 (Europe/London, UTC+1 BST)

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists slots (
  id            uuid primary key default gen_random_uuid(),
  business_id   text not null,
  starts_at     timestamptz not null,
  duration_min  integer not null default 30,
  is_booked     boolean not null default false,
  constraint slots_duration_positive check (duration_min > 0)
);

create index if not exists slots_business_open
  on slots (business_id, starts_at)
  where not is_booked;

create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  business_id   text not null,
  slot_id       uuid not null references slots(id),
  caller_name   text not null,
  reason        text not null default '',
  starts_at     timestamptz not null,
  status        text not null default 'booked'
                  check (status in ('booked', 'cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists appointments_business_created
  on appointments (business_id, created_at desc);

create table if not exists call_logs (
  id              uuid primary key default gen_random_uuid(),
  business_id     text not null,
  transcript      text not null default '',
  summary         text,
  appointment_id  uuid references appointments(id),
  created_at      timestamptz not null default now()
);

create index if not exists call_logs_business_created
  on call_logs (business_id, created_at desc);

create table if not exists live_calls (
  id              uuid primary key default gen_random_uuid(),
  business_id     text not null,
  caller_name     text,
  caller_phone    text,
  status          text not null default 'ringing'
                    check (status in ('ringing', 'live', 'booked', 'ended')),
  transcript      text not null default '',
  current_speaker text check (current_speaker in ('caller', 'agent')),
  appointment_id  uuid references appointments(id),
  started_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  ended_at        timestamptz
);

create index if not exists live_calls_business_status_updated
  on live_calls (business_id, status, updated_at desc);

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime publications for live dashboard updates.
-- (Run once; idempotent via DO block.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table appointments;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'call_logs'
  ) then
    alter publication supabase_realtime add table call_logs;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_calls'
  ) then
    alter publication supabase_realtime add table live_calls;
  end if;
end $$;

-- ============================================================
-- SEED DATA
-- ~6 open slots spread across the next 3 working days after 2026-06-12.
-- Stored in UTC; Europe/London is UTC+1 (BST) in June.
-- 10:00 BST = 09:00 UTC,  14:00 BST = 13:00 UTC
-- ============================================================

insert into slots (id, business_id, starts_at, duration_min, is_booked) values
  -- Saturday 2026-06-13
  ('00000000-0000-0000-0000-000000000001', 'marina-physio', '2026-06-13T09:00:00Z', 30, false),
  ('00000000-0000-0000-0000-000000000002', 'marina-physio', '2026-06-13T13:00:00Z', 30, false),
  -- Monday 2026-06-15
  ('00000000-0000-0000-0000-000000000003', 'marina-physio', '2026-06-15T09:00:00Z', 30, false),
  ('00000000-0000-0000-0000-000000000004', 'marina-physio', '2026-06-15T13:00:00Z', 30, false),
  -- Tuesday 2026-06-16
  ('00000000-0000-0000-0000-000000000005', 'marina-physio', '2026-06-16T09:00:00Z', 30, false),
  ('00000000-0000-0000-0000-000000000006', 'marina-physio', '2026-06-16T13:00:00Z', 30, false)
on conflict (id) do nothing;
