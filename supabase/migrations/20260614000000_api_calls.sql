-- Lightweight abuse-protection table: one row per inbound API call.
-- Used by lib/rate-limit.ts to enforce per-IP-per-hour and per-day-global caps.

create table if not exists api_calls (
  id          uuid primary key default gen_random_uuid(),
  endpoint    text not null,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists api_calls_endpoint_ip_created on api_calls (endpoint, ip, created_at);
create index if not exists api_calls_endpoint_created    on api_calls (endpoint, created_at);

-- Writes go through the service role only; deny all other access.
alter table api_calls enable row level security;
