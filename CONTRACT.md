# Frontdesk — build contract

AI voice receptionist for a solo service business. Hackathon MVP. The 90-second
demo IS the spec: caller talks in-browser → agent books a real open slot →
booking + transcript + AI summary appear live on the owner dashboard.

Single hardcoded business: **Marina Physio** (`BUSINESS_ID = "marina-physio"`).

## Surfaces
1. `/` — public caller page. Big "Call the clinic" button starts an ElevenLabs
   Conversational AI session in the browser (`@elevenlabs/react`, WebRTC).
2. `/dashboard` — owner view, Auth0-gated. Live list of appointments + call
   transcripts + the one-line AI summary. Simple availability display.

## Reliability rules (do not deviate without flagging)
- **ElevenLabs CLIENT tools, not server webhooks.** The agent's tools run in the
  browser via the SDK's `clientTools` and `fetch` our own same-origin API routes.
  No inbound webhooks, no localhost exposure. Lower latency, demo-safe.
- **Dashboard polls every 1500ms** as the reliable baseline. Supabase realtime is
  a bonus layer, never the only path.
- Seed availability so a bookable slot always exists during the demo.
- Demo runs from the live Vercel HTTPS URL (mic needs HTTPS).

## Data model (Supabase Postgres) — see `supabase/schema.sql`
- `slots(id, business_id, starts_at, duration_min, is_booked)`
- `appointments(id, business_id, slot_id, caller_name, reason, starts_at, status, created_at)`
- `call_logs(id, business_id, transcript, summary, appointment_id, created_at)`
Types are defined in `lib/types.ts` — import from there, do not redefine.

## API routes (Next.js App Router, same-origin)
- `GET  /api/availability?date=<optional>` → `CheckAvailabilityResult`
  Returns up to ~3 upcoming open slots, each with a human label
  (e.g. "Thursday 2:00 PM").
- `POST /api/book` body `BookAppointmentArgs` → `BookAppointmentResult`
  Marks the slot booked, creates the appointment, returns a confirmation line.
- `POST /api/call-log` body `{ transcript, appointment_id? }` → `{ id }`
  Stores the transcript, then summarizes it via **Vercel AI Gateway** (AI SDK
  `generateText`) into a one-line "what the caller wanted" and saves `summary`.

## ElevenLabs agent
- Created programmatically via the ConvAI API in `scripts/create-agent.ts`
  (run with `npx tsx`). Prints the agent id → goes in
  `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.
- Persona: warm, concise front-desk receptionist for Marina Physio. Confirms
  details back, never invents availability — always uses the `check_availability`
  tool, then `book_appointment`.
- Two client tools declared on the agent: `check_availability(date?)` and
  `book_appointment(slot_id, caller_name, reason)`. The browser maps these to the
  API routes above.

## Env
All in `.env.local` (gitignored). ElevenLabs key already set. Marc fills Supabase,
Auth0, Vercel AI Gateway, and the agent id.

## File ownership (avoid collisions)
- **Backend** owns: `supabase/`, `app/api/**`, `lib/supabase.ts`, `lib/ai.ts`,
  `scripts/create-agent.ts`.
- **Design** owns: `app/globals.css`, Tailwind theme, `components/**`, the visual
  shells of `app/page.tsx` and `app/dashboard/**`.
- **Web (wave 2)** owns: the ElevenLabs `useConversation` wiring + clientTools,
  dashboard data polling, Auth0 wiring, deploy.

## Aesthetic
Vercel look: Geist font, near-black/white base, generous whitespace, crisp
geometric cards, subtle borders, one confident accent. Clean and premium —
"a clinic would pay for this."
