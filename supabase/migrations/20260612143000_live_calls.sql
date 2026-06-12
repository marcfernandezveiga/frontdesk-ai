-- Live phone-call state for the owner dashboard.
-- Browser demo calls write here today. Twilio/ElevenLabs phone webhooks can write
-- to the same table when a real phone number is connected.

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

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_calls'
  ) then
    alter publication supabase_realtime add table live_calls;
  end if;
end $$;
