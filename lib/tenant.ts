// Multi-tenant config for Frontdesk businesses.
// One ElevenLabs agent is shared across tenants; per-business behaviour comes
// from session overrides built off this config.

export interface BrandTheme {
  bg: string; // page background, hex
  fg: string; // primary text, hex
  accent: string; // brand accent, hex
  accentFg: string; // text/icon on accent, hex
  muted: string; // secondary text + subtle surfaces, hex
  border: string; // hairline borders, hex
  radius: string; // e.g. "12px"
  fontSans: string; // CSS font-family stack
  fontUrl?: string; // optional web-font <link> href
  logoUrl?: string; // business logo
  heroUrl?: string; // optional hero/background image
}

// 0 = Sunday .. 6 = Saturday. null means closed that day.
export type BusinessHours = Record<
  number,
  { open: string; close: string } | null
>;

export interface Service {
  name: string;
}

export interface TenantConfig {
  slug: string;
  name: string;
  description: string;
  timezone: string; // IANA, e.g. "Europe/London"
  tagline?: string;
  greeting: string; // agent's first spoken line
  services: Service[];
  hours: BusinessHours;
  theme: BrandTheme;
  slotDurationMin: number; // default 30
}

// The Vercel-look default theme. Used as the baseline before a brand is applied
// and as the fallback when extraction confidence is low.
export const DEFAULT_THEME: BrandTheme = {
  bg: "#ffffff",
  fg: "#0a0a0a",
  accent: "#0070f3",
  accentFg: "#ffffff",
  muted: "#666666",
  border: "#eaeaea",
  radius: "12px",
  fontSans:
    'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
};

// Maps a theme to the CSS custom properties the components read.
// Components MUST style via these vars (never hardcoded brand colors) so a
// tenant theme can override them on a wrapper element.
export function themeToCssVars(t: BrandTheme): Record<string, string> {
  return {
    "--fd-bg": t.bg,
    "--fd-fg": t.fg,
    "--fd-accent": t.accent,
    "--fd-accent-fg": t.accentFg,
    "--fd-muted": t.muted,
    "--fd-border": t.border,
    "--fd-radius": t.radius,
    "--fd-font-sans": t.fontSans,
  };
}
