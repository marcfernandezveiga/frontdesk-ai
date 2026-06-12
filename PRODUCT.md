# Frontdesk

AI voice receptionist for a solo physio clinic. Hackathon MVP. Demo IS the spec.

## Register

product

## Business

Marina Physio — a solo physiotherapy clinic. Single hardcoded business. Warm,
trustworthy, clinical-but-approachable.

## Surfaces

- `/` — public caller page. No auth. Anyone can call. Mobile-first (callers will
  be on their phones).
- `/dashboard` — owner view. Auth0-gated. Desktop-first (Marina checks on a laptop).

## Design

Vercel design language. Deliberate choice: judges are Vercel.

- Font: Geist Sans + Geist Mono
- Palette: #000 / #fff base, geist-gray scale, #0070f3 accent (sparingly)
- Borders: 1px, crisp, subtle. No colored side-stripes.
- Radii: sm (4px) for cards/inputs, full for status badges only
- Whitespace: generous
- Motion: functional, 150–200ms, ease-out. No decorative choreography.
- Dark mode: light mode only for the caller page (public-facing, bright/clean).
  Dashboard can support dark mode via system preference.

## Brand voice

Calm, professional, reassuring. "Your clinic is covered." No jargon.
