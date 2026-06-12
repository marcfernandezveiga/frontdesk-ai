-- Migration: add businesses table + seed marina-physio
-- Timestamp: 20260612130000 (after init 20260612120000)
-- Idempotent: create table if not exists, on conflict do nothing

-- ============================================================
-- businesses table
-- ============================================================

create table if not exists businesses (
  slug             text primary key,
  name             text not null,
  description      text not null default '',
  timezone         text not null default 'Europe/London',
  tagline          text,
  greeting         text not null default '',
  services         jsonb not null default '[]',
  hours            jsonb not null default '{}',
  theme            jsonb not null default '{}',
  slot_duration_min int  not null default 30,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- Seed: marina-physio
-- DEFAULT_THEME colors, physio services, Mon-Fri 9-5
-- Hours stored as {dayIndex: {open, close} | null}
-- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
-- ============================================================

insert into businesses (
  slug,
  name,
  description,
  timezone,
  tagline,
  greeting,
  services,
  hours,
  theme,
  slot_duration_min
) values (
  'marina-physio',
  'Marina Physio',
  'Physiotherapy clinic in London specialising in sports injuries, post-surgery rehab, and chronic pain.',
  'Europe/London',
  'Back on your feet, faster.',
  'Hello, thanks for calling Marina Physio. How can I help you today?',
  '[
    {"name": "Initial assessment"},
    {"name": "Sports injury treatment"},
    {"name": "Post-surgery rehabilitation"},
    {"name": "Chronic pain management"},
    {"name": "Massage therapy"}
  ]',
  '{
    "0": null,
    "1": {"open": "09:00", "close": "17:00"},
    "2": {"open": "09:00", "close": "17:00"},
    "3": {"open": "09:00", "close": "17:00"},
    "4": {"open": "09:00", "close": "17:00"},
    "5": {"open": "09:00", "close": "17:00"},
    "6": null
  }',
  '{
    "bg": "#ffffff",
    "fg": "#0a0a0a",
    "accent": "#0070f3",
    "accentFg": "#ffffff",
    "muted": "#666666",
    "border": "#eaeaea",
    "radius": "12px",
    "fontSans": "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif"
  }',
  30
)
on conflict (slug) do nothing;
