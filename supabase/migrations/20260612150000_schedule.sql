-- Migration: add schedule jsonb to businesses, backfill marina-physio
-- Timestamp: 20260612150000
-- Idempotent: uses IF NOT EXISTS / ON CONFLICT

-- ============================================================
-- Add schedule column (idempotent)
-- ============================================================

alter table businesses
  add column if not exists schedule jsonb;

-- ============================================================
-- Backfill marina-physio with DEFAULT_SCHEDULE
-- (weekdays Mon-Fri 09:00-17:00, 30-min slots)
-- ============================================================

update businesses
set schedule = '{
  "slotDurationMin": 30,
  "week": {
    "0": {"enabled": false, "shifts": []},
    "1": {"enabled": true,  "shifts": [{"start": "09:00", "end": "17:00"}]},
    "2": {"enabled": true,  "shifts": [{"start": "09:00", "end": "17:00"}]},
    "3": {"enabled": true,  "shifts": [{"start": "09:00", "end": "17:00"}]},
    "4": {"enabled": true,  "shifts": [{"start": "09:00", "end": "17:00"}]},
    "5": {"enabled": true,  "shifts": [{"start": "09:00", "end": "17:00"}]},
    "6": {"enabled": false, "shifts": []}
  }
}'::jsonb
where slug = 'marina-physio'
  and schedule is null;
