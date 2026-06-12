-- Unique constraint so per-tenant slot seeding can upsert on (business_id, starts_at).
-- Without this, POST /api/businesses' onConflict target has no match and seeds 0 slots.
-- Run in the Supabase SQL editor or via `supabase db push`.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'slots_business_starts_unique'
  ) then
    alter table slots
      add constraint slots_business_starts_unique unique (business_id, starts_at);
  end if;
end $$;
