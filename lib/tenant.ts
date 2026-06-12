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
  hours: BusinessHours; // DEPRECATED, kept for back-compat. `schedule` is the source of truth.
  schedule: Schedule;
  theme: BrandTheme;
  slotDurationMin: number; // DEPRECATED, use schedule.slotDurationMin
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

// ---- Working schedule (supports split shifts, e.g. 12:00-16:00 and 20:00-23:00) ----

// A continuous block of opening time within one day. Local "HH:MM" clock times.
export interface Shift {
  start: string; // "09:00"
  end: string; // "17:00"
}

// One weekday. enabled=false means closed (no bookings that day).
export interface DaySchedule {
  enabled: boolean;
  shifts: Shift[];
}

// 0 = Sunday .. 6 = Saturday.
export type WeekSchedule = Record<number, DaySchedule>;

export interface Schedule {
  week: WeekSchedule;
  slotDurationMin: number; // booking length in minutes, e.g. 30, 60, 90
}

const CLOSED: DaySchedule = { enabled: false, shifts: [] };
const NINE_TO_FIVE: DaySchedule = {
  enabled: true,
  shifts: [{ start: "09:00", end: "17:00" }],
};
const everyDay = (day: DaySchedule): WeekSchedule =>
  Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, day])) as WeekSchedule;

export const DEFAULT_SCHEDULE: Schedule = {
  slotDurationMin: 30,
  week: {
    0: CLOSED,
    1: NINE_TO_FIVE,
    2: NINE_TO_FIVE,
    3: NINE_TO_FIVE,
    4: NINE_TO_FIVE,
    5: NINE_TO_FIVE,
    6: CLOSED,
  },
};

// Starting points the onboarding step offers. Owners tweak from here.
export const SCHEDULE_PRESETS: {
  id: string;
  label: string;
  schedule: Schedule;
}[] = [
  { id: "weekdays", label: "Weekdays, 9 to 5", schedule: DEFAULT_SCHEDULE },
  {
    id: "weekdays-sat",
    label: "Weekdays plus Saturday",
    schedule: {
      slotDurationMin: 30,
      week: {
        0: CLOSED,
        1: NINE_TO_FIVE,
        2: NINE_TO_FIVE,
        3: NINE_TO_FIVE,
        4: NINE_TO_FIVE,
        5: NINE_TO_FIVE,
        6: { enabled: true, shifts: [{ start: "10:00", end: "16:00" }] },
      },
    },
  },
  {
    id: "everyday",
    label: "Every day",
    schedule: { slotDurationMin: 30, week: everyDay(NINE_TO_FIVE) },
  },
  {
    id: "restaurant",
    label: "Restaurant, lunch and dinner",
    schedule: {
      slotDurationMin: 90,
      week: everyDay({
        enabled: true,
        shifts: [
          { start: "12:00", end: "15:00" },
          { start: "19:00", end: "22:30" },
        ],
      }),
    },
  },
];
