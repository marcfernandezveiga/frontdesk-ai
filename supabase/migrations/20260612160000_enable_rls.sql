-- Lock down public access. All app DB access goes through server routes using the
-- service role (which bypasses RLS), so enabling RLS with no policies denies the
-- public anon key any read/write while the app keeps working.

alter table businesses enable row level security;
alter table slots enable row level security;
alter table appointments enable row level security;
alter table call_logs enable row level security;
alter table live_calls enable row level security;
