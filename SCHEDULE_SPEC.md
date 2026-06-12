# Frontdesk — booking schedule feature

Today slots are seeded from a single open/close per day for a fixed 7 days. We're
replacing that with a real schedule the owner sets, which supports split shifts.
The owner sets it during onboarding (after confirming brand). The schedule is the
single source of truth: it generates the bookable slots that the B2B dashboard
shows as a weekly grid (available vs booked) and that the ElevenLabs caller reads
via `/api/availability` to take bookings.

## Copy rules (every UI string)
NO em dashes. NO AI-slop ("seamless", "effortless", "elevate", "unlock"). Plain, human.

## Model (already added to `lib/tenant.ts`, import from there)
`Shift {start,end}` (local "HH:MM"), `DaySchedule {enabled, shifts[]}`,
`WeekSchedule = Record<0..6, DaySchedule>` (0=Sun), `Schedule {week, slotDurationMin}`,
plus `DEFAULT_SCHEDULE` and `SCHEDULE_PRESETS`. `TenantConfig.schedule` is now the
source of truth; `hours` / top-level `slotDurationMin` are deprecated back-compat.

## Slot generation (shared, single implementation in `lib/schedule.ts` — BACKEND creates)
- `generateSlots(schedule, timezone, opts?): { startsAtUtc: string; durationMin: number }[]`
  For each of the next `days` (default 14) calendar days in `timezone`: look up that
  weekday's DaySchedule; if `enabled`, for EACH shift step from `start` to `end` by
  `slotDurationMin`, emitting a slot whenever `cursor + slotDurationMin <= shiftEnd`.
  Convert each local time to a UTC ISO string (reuse the tz-offset approach already in
  `app/api/businesses/route.ts`). Skip past times. Split shifts must produce two
  separate blocks of slots with the gap empty.
- `countSlotsPerWeek(schedule): number` — for the onboarding live preview.
- Pure functions, no IO. Onboarding (web) and seeding (backend) both import these.

## Backend
- MIGRATION (new file `supabase/migrations/<ts>_schedule.sql`, idempotent): add
  `schedule jsonb` to `businesses`. Backfill `marina-physio` with DEFAULT_SCHEDULE.
- `POST /api/businesses`: seed slots from `schedule` via `generateSlots` (14 days),
  not the old hours path. On RE-publish/update of an existing slug, first delete that
  business's FUTURE UNBOOKED slots (`starts_at > now() and is_booked = false`), then
  upsert the new ones (keep booked slots intact). Store `schedule` on the row.
- `GET /api/businesses/[slug]`: return `schedule` (fall back to DEFAULT_SCHEDULE if the
  column is null, or derive from legacy `hours` if present).
- `lib/extract.ts`: produce a sensible `schedule` guess from the business type in the
  description (restaurant -> split lunch/dinner preset; clinic/shop -> weekdays). Still
  best-effort; the owner sets the real one in onboarding.
- NEW `GET /api/schedule-week?business=<slug>&weekStart=<ISO date>`: returns every slot
  (booked AND open) in that 7-day window for the grid:
  `{ slots: { id, startsAt, durationMin, isBooked, appointment?: { callerName, reason } }[] }`.
  Tenant-scoped. Keep existing `/api/availability` (open-only) unchanged for the caller.

## Onboarding (a new step between Preview and Published)
- New component `components/onboarding/OnboardingSchedule.tsx` (DESIGN owns): the owner
  picks days and shifts and slot duration.
  - Preset chips from `SCHEDULE_PRESETS` (Weekdays, Weekdays plus Saturday, Every day,
    Restaurant lunch and dinner) as quick starts.
  - Per weekday: an on/off toggle, and one or more shift rows (start + end time inputs)
    with add/remove shift. This is how split shifts (12:00-16:00 and 20:00-23:00) are set.
  - Slot duration control (15 / 30 / 45 / 60 / 90, plus custom).
  - A live "about N bookable slots per week" line via `countSlotsPerWeek`.
- Flow change (WEB owns, in `app/onboard/page.tsx` + `OnboardingFlow`): order becomes
  input -> extracting -> preview (brand) -> schedule -> published. The draft gains
  `schedule` (seed it from the extracted guess). Publish posts the draft incl. schedule.

## B2B dashboard weekly grid
- New component `components/dashboard/ScheduleWeek.tsx` (DESIGN owns): a week view, day
  columns x time rows, each cell a slot styled clearly as available vs booked (booked
  shows the caller name on hover/inline). Week back/forward nav. Empty and loading states.
  Brand-neutral (owner's internal tool), uses the dashboard's own tokens.
- Wire into `/b/[slug]` (WEB owns): fetch `GET /api/schedule-week?business=&weekStart=`,
  poll or refetch on the same cadence as the rest of the dashboard so new bookings show.

## File ownership
- BACKEND: `lib/schedule.ts`, `lib/extract.ts`, `supabase/migrations/*schedule*`,
  `app/api/businesses/**`, `app/api/schedule-week/**`. Don't touch components or onboard/b pages.
- DESIGN: `components/onboarding/OnboardingSchedule.tsx`,
  `components/dashboard/ScheduleWeek.tsx`, related types in the *Types.ts files,
  `app/globals.css` if needed. Prop-driven, mock data. Don't touch app/api or app/*/page.tsx.
- WEB (wave B): `app/onboard/page.tsx`, `app/b/[slug]/page.tsx`, `OnboardingFlow` wiring,
  data fetching, deploy. Read current files first (Codex changed some), extend don't rewrite.
