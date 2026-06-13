-- Lightweight first-party analytics: one row per page view.
-- Unique people  = count(distinct visitor_id)   (persistent localStorage id)
-- Unique sessions = count(distinct session_id)   (per-tab sessionStorage id)
-- Total views     = count(*)

create table if not exists page_views (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text not null,
  session_id  text,
  path        text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_visitor on page_views (visitor_id);
create index if not exists page_views_created on page_views (created_at);

-- Writes go through the service role (server route), so deny everyone else.
alter table page_views enable row level security;
