# Frontdesk — multi-tenant "Instant Setup" contract

Turns Frontdesk into a business-agnostic product. A business owner pastes their
website URL + a one-line description, we extract their brand and profile, show a
live preview of their own branded caller page, they review/edit, publish, and get
a shareable call link + dashboard. The on-stage wow is the transform: generic
Vercel look becomes their brand in ~20s.

Single hardcoded business is gone. Everything is keyed by tenant `slug`.
Marina Physio becomes the first seeded tenant (`slug = "marina-physio"`).

## Copy rules (NON-NEGOTIABLE — applies to ALL UI text and generated copy)
- NO em dashes anywhere. Use commas, periods, or parentheses.
- NO AI-slop filler: never "seamless", "elevate", "unlock", "effortless",
  "supercharge", "in today's fast-paced world", "we've got you covered",
  "take it to the next level", "powered by cutting-edge AI", exclamation spam.
- Write like a sharp human product person. Short, concrete, plain. If a line
  sounds like a landing-page generator wrote it, rewrite it.

## Routing
- `/` — light landing. One clear value line + primary CTA to `/onboard`, and a
  "see a live example" link to `/c/marina-physio`. Keep it minimal.
- `/onboard` — the setup flow (input → extracting → preview → publish).
- `/c/[slug]` — the branded caller page for a tenant (themed + tenant agent).
- `/b/[slug]` — the tenant dashboard (bookings + transcripts), no login for demo.
- Keep the old `/` caller and `/dashboard` working as redirects to the
  marina-physio tenant so nothing already deployed breaks.

## Types — import from `lib/tenant.ts` (do not redefine)
`TenantConfig`, `BrandTheme`, `BusinessHours`, `Service`, `DEFAULT_THEME`,
`themeToCssVars`. Domain booking types stay in `lib/types.ts`.

## Theming system (how brand is applied)
- Components style via CSS variables ONLY for brand-affected color/font/radius:
  `--fd-bg --fd-fg --fd-accent --fd-accent-fg --fd-muted --fd-border --fd-radius
  --fd-font-sans`. Defaults (the Vercel look) live in `globals.css :root`.
- `/c/[slug]` sets these vars inline on a root wrapper from `tenant.theme` via
  `themeToCssVars`. Logo and hero render from `theme.logoUrl` / `theme.heroUrl`.
- Designer refactors the existing caller + dashboard components to read these
  vars instead of hardcoded `#0070f3` / black / white, with no visual change to
  the default look.

## Data model (Supabase) — add to `supabase/schema.sql`
`businesses`:
- `slug text primary key`
- `name text`, `description text`, `timezone text default 'Europe/London'`
- `tagline text`, `greeting text`
- `services jsonb` (array of {name}), `hours jsonb` (BusinessHours)
- `theme jsonb` (BrandTheme), `slot_duration_min int default 30`
- `created_at timestamptz default now()`
Seed a `marina-physio` row with the DEFAULT_THEME and sensible physio services /
Mon-Fri 9-5 hours. Existing `slots/appointments/call_logs.business_id` now
references `businesses.slug` (string ids, keep `marina-physio`).

## API (Next.js App Router)
- `POST /api/onboard` body `{ url, description }` → returns a DRAFT `TenantConfig`
  (no slug yet). Pipeline below. Never throws to the client: on any failure,
  returns a usable draft on DEFAULT_THEME so the flow always proceeds.
- `POST /api/businesses` body `TenantConfig` → assigns a slug (from name),
  upserts the business, seeds availability from `hours` for the next 7 days at
  `slotDurationMin`, returns `{ slug }`.
- `GET /api/businesses/[slug]` → `TenantConfig`.
- Existing `GET /api/availability`, `POST /api/book`, `GET /api/dashboard` gain a
  `?business=<slug>` param (default `marina-physio`). Booking client tools on
  `/c/[slug]` pass the slug.

## Extraction pipeline (`POST /api/onboard`) — provider-agnostic, resilient
1. DETERMINISTIC (no LLM, always runs):
   - Fetch site metadata + screenshot + color palette + logo via Microlink
     (`https://api.microlink.io/?url=...&palette&screenshot`). Plain fetch, no key
     needed for the free tier. Pull logoUrl, hero (og:image), palette colors,
     title, description.
   - Derive `theme` colors from the palette (pick a readable bg/fg/accent),
     fonts via a quick regex over the page HTML / Google Fonts links.
2. LLM REFINEMENT (optional, behind `lib/ai-provider.ts`):
   - Given the user description + page title/description + screenshot URL, produce
     `name`, `tagline`, `services[]`, `hours`, `greeting`, and optionally refine
     the palette into a clean `BrandTheme` (vision if available).
   - Provider abstraction reads whichever key exists, in this order:
     `OPENAI_API_KEY` (via `@ai-sdk/openai`), else `GOOGLE_GENERATIVE_AI_API_KEY`
     (via `@ai-sdk/google`), else `AI_GATEWAY_API_KEY`. If none set, SKIP the LLM
     and fill `services/hours/greeting` from simple templates off the description.
   - The whole step is best-effort: any error falls back to deterministic + template.
3. Always return a complete, valid draft `TenantConfig`.

## ElevenLabs (single shared agent, per-tenant overrides)
- Keep one agent (`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`). Enable prompt +
  first_message overrides on it via the ConvAI API (backend: update agent so
  `conversation_config` allows overrides). Its base prompt is a template.
- `/c/[slug]` starts the session with overrides built from the tenant:
  `startSession({ conversationToken, overrides: { agent: { prompt: { prompt:
  <composed prompt with name/services/hours/tone> }, firstMessage: greeting } } })`.
  The booking client tools call the tenant-scoped APIs with `?business=slug`.

## File ownership (avoid collisions)
- BACKEND owns: `supabase/schema.sql`, `app/api/**`, `lib/supabase.ts`,
  `lib/ai-provider.ts`, `lib/extract.ts`, `scripts/*agent*`.
- DESIGN owns: `app/globals.css`, Tailwind theme, `components/**`, the visual
  shells of `/`, `/onboard`, and the themeable refactor of caller + dashboard.
- WEB (wave B) owns: `app/onboard/**`, `app/c/[slug]/**`, `app/b/[slug]/**`,
  routing/redirects, theme application, ElevenLabs overrides wiring, deploy.
