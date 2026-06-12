/**
 * Brand extraction pipeline for POST /api/onboard.
 *
 * Step 1 (always): Microlink free-tier fetch for logo, hero, palette, title, description.
 * Step 2 (optional): LLM refinement via ai-provider.ts, only if hasLLM().
 *
 * Always returns a complete valid TenantConfig draft (no slug yet — caller assigns).
 * Never throws to the caller.
 */

import { generateObject } from "ai";
import { z } from "zod";
import type { TenantConfig, BrandTheme, BusinessHours } from "./tenant";
import { DEFAULT_THEME } from "./tenant";
import { hasLLM, getVisionModel } from "./ai-provider";

// ---------------------------------------------------------------------------
// Microlink
// ---------------------------------------------------------------------------

interface MicrolinkResponse {
  status: string;
  data?: {
    title?: string;
    description?: string;
    url?: string;
    logo?: { url?: string };
    image?: { url?: string };
    screenshot?: { url?: string };
    palette?: string[];
  };
}

async function fetchMicrolink(url: string): Promise<MicrolinkResponse["data"]> {
  const encoded = encodeURIComponent(url);
  const microlinkUrl = `https://api.microlink.io/?url=${encoded}&palette&screenshot`;
  const res = await fetch(microlinkUrl, {
    headers: { Accept: "application/json" },
    // 10s timeout via AbortController
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Microlink HTTP ${res.status}`);
  const json = (await res.json()) as MicrolinkResponse;
  if (json.status !== "success") throw new Error(`Microlink status: ${json.status}`);
  return json.data ?? {};
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

/** Check if a hex color has enough contrast against white for readable text. */
function contrastVsWhite(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return (1.05) / (L + 0.05);
}

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

/** Derive a readable BrandTheme from a palette array of hex strings. */
function paletteToTheme(palette: string[]): BrandTheme {
  const valid = palette.filter(isValidHex);
  if (valid.length === 0) return { ...DEFAULT_THEME };

  // Pick the darkest color that has good contrast vs white as accent
  const withContrast = valid.map((h) => ({ hex: h, contrast: contrastVsWhite(h) }));
  withContrast.sort((a, b) => b.contrast - a.contrast);

  const accent = withContrast[0]?.hex ?? DEFAULT_THEME.accent;
  // Lightest color as background
  const bg = valid[valid.length - 1] ?? DEFAULT_THEME.bg;
  // Second darkest as fg, or fallback
  const fg = withContrast[1]?.hex ?? DEFAULT_THEME.fg;

  return {
    ...DEFAULT_THEME,
    bg,
    fg,
    accent,
    accentFg: "#ffffff",
    muted: valid[Math.floor(valid.length / 2)] ?? DEFAULT_THEME.muted,
    border: valid[valid.length - 2] ?? DEFAULT_THEME.border,
  };
}

// ---------------------------------------------------------------------------
// Font detection from raw HTML
// ---------------------------------------------------------------------------

function extractFonts(html: string): { fontSans: string; fontUrl?: string } {
  // Google Fonts <link> href
  const gfMatch = html.match(/href="(https:\/\/fonts\.googleapis\.com\/css[^"]+)"/);
  if (gfMatch) {
    const href = gfMatch[1];
    // Extract family name from ?family=Roboto:... or CSS2 ?family=Roboto
    const familyMatch = href.match(/family=([^&:;|,]+)/);
    if (familyMatch) {
      const family = decodeURIComponent(familyMatch[1]).replace(/\+/g, " ").split(":")[0].trim();
      if (family) {
        return {
          fontSans: `'${family}', ui-sans-serif, system-ui, sans-serif`,
          fontUrl: href,
        };
      }
    }
  }
  // font-family in CSS
  const cssMatch = html.match(/font-family:\s*['"]?([^'";,\n]{3,40})/);
  if (cssMatch) {
    const family = cssMatch[1].replace(/['"]/g, "").trim();
    return { fontSans: `'${family}', ui-sans-serif, system-ui, sans-serif` };
  }
  return { fontSans: DEFAULT_THEME.fontSans };
}

// ---------------------------------------------------------------------------
// Template fallbacks (no LLM)
// ---------------------------------------------------------------------------

function templateServices(description: string): { name: string }[] {
  const lower = description.toLowerCase();
  if (lower.includes("physio") || lower.includes("rehab")) {
    return [
      { name: "Initial assessment" },
      { name: "Sports injury treatment" },
      { name: "Rehabilitation" },
    ];
  }
  if (lower.includes("salon") || lower.includes("hair") || lower.includes("beauty")) {
    return [{ name: "Haircut" }, { name: "Colour treatment" }, { name: "Styling" }];
  }
  if (lower.includes("dental") || lower.includes("dentist")) {
    return [{ name: "Check-up" }, { name: "Cleaning" }, { name: "Consultation" }];
  }
  return [{ name: "Consultation" }, { name: "Appointment" }];
}

function templateHours(): BusinessHours {
  // Mon-Fri 9-5
  return {
    0: null,
    1: { open: "09:00", close: "17:00" },
    2: { open: "09:00", close: "17:00" },
    3: { open: "09:00", close: "17:00" },
    4: { open: "09:00", close: "17:00" },
    5: { open: "09:00", close: "17:00" },
    6: null,
  };
}

function templateGreeting(name: string): string {
  return `Hello, thanks for calling ${name}. How can I help you today?`;
}

// ---------------------------------------------------------------------------
// LLM refinement schema
// ---------------------------------------------------------------------------

const LLMDraftSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().nullable(),
  greeting: z.string().min(1),
  services: z.array(z.object({ name: z.string() })).min(1).max(10),
  hours: z.object({
    "0": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "1": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "2": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "3": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "4": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "5": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
    "6": z.union([z.object({ open: z.string(), close: z.string() }), z.null()]),
  }),
  theme: z.object({
    bg: z.string(),
    fg: z.string(),
    accent: z.string(),
    accentFg: z.string(),
    muted: z.string(),
    border: z.string(),
    radius: z.string(),
    fontSans: z.string(),
  }),
});

type LLMDraft = z.infer<typeof LLMDraftSchema>;

// ---------------------------------------------------------------------------
// Main extract function
// ---------------------------------------------------------------------------

export interface ExtractInput {
  url: string;
  description: string;
}

export async function extractBrand(input: ExtractInput): Promise<TenantConfig> {
  const { url, description } = input;

  // --- Step 1: Deterministic ---
  let title = "";
  let metaDescription = "";
  let logoUrl: string | undefined;
  let heroUrl: string | undefined;
  let screenshotUrl: string | undefined;
  let palette: string[] = [];
  let fontSans = DEFAULT_THEME.fontSans;
  let fontUrl: string | undefined;

  try {
    const data = await fetchMicrolink(url);
    title = data?.title ?? "";
    metaDescription = data?.description ?? "";
    logoUrl = data?.logo?.url;
    heroUrl = data?.image?.url;
    screenshotUrl = data?.screenshot?.url;
    palette = (data?.palette ?? []) as string[];
  } catch (err) {
    console.warn("[extract] Microlink fetch failed:", err);
  }

  // Try to get fonts from raw page HTML
  try {
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FrontdeskBot/1.0)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const fonts = extractFonts(html);
      fontSans = fonts.fontSans;
      fontUrl = fonts.fontUrl;
    }
  } catch {
    // best-effort
  }

  const deterministicTheme: BrandTheme = {
    ...(palette.length > 0 ? paletteToTheme(palette) : { ...DEFAULT_THEME }),
    logoUrl,
    heroUrl,
    fontSans,
    fontUrl,
  };

  // Fallback name from title or URL hostname
  const fallbackName = title || new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  const fallbackServices = templateServices(description);
  const fallbackHours = templateHours();
  const fallbackGreeting = templateGreeting(fallbackName);

  // --- Step 2: LLM refinement (optional) ---
  if (hasLLM()) {
    try {
      const model = getVisionModel();

      const systemPrompt = `You are a brand analyst. Given a business URL, its page title, description, and optionally a screenshot URL, return structured data about the business.

Copy rules (non-negotiable):
- No em dashes anywhere.
- No filler words: "seamless", "elevate", "unlock", "effortless", "supercharge".
- Write plain, human, concrete copy.
- Taglines should be short (under 10 words), specific, and honest.
- Greetings should sound like a real receptionist, not a chatbot.`;

      const userContent = [
        `URL: ${url}`,
        `Page title: ${title || "(not found)"}`,
        `Page description: ${metaDescription || "(not found)"}`,
        `User description: ${description}`,
        screenshotUrl ? `Screenshot URL: ${screenshotUrl}` : "",
        `Detected palette colors: ${palette.slice(0, 5).join(", ") || "(none)"}`,
      ].filter(Boolean).join("\n");

      const { object } = await generateObject({
        model: model as Parameters<typeof generateObject>[0]["model"],
        schema: LLMDraftSchema,
        system: systemPrompt,
        prompt: userContent,
      });

      const llm = object as LLMDraft;

      // Merge LLM output with deterministic baseline
      const mergedTheme: BrandTheme = {
        ...deterministicTheme,
        ...(llm.theme?.bg && isValidHex(llm.theme.bg) ? { bg: llm.theme.bg } : {}),
        ...(llm.theme?.fg && isValidHex(llm.theme.fg) ? { fg: llm.theme.fg } : {}),
        ...(llm.theme?.accent && isValidHex(llm.theme.accent) ? { accent: llm.theme.accent } : {}),
        ...(llm.theme?.accentFg && isValidHex(llm.theme.accentFg) ? { accentFg: llm.theme.accentFg } : {}),
        ...(llm.theme?.muted && isValidHex(llm.theme.muted) ? { muted: llm.theme.muted } : {}),
        ...(llm.theme?.border && isValidHex(llm.theme.border) ? { border: llm.theme.border } : {}),
        ...(llm.theme?.radius ? { radius: llm.theme.radius } : {}),
        ...(llm.theme?.fontSans ? { fontSans: llm.theme.fontSans } : {}),
      };

      const hours: BusinessHours = {};
      for (let d = 0; d <= 6; d++) {
        const key = String(d) as keyof typeof llm.hours;
        const v = llm.hours[key];
        if (v && typeof v === "object" && "open" in v && "close" in v) {
          hours[d] = { open: (v as { open: string; close: string }).open, close: (v as { open: string; close: string }).close };
        } else {
          hours[d] = null;
        }
      }

      return {
        slug: "",
        name: llm.name,
        description: description || metaDescription || "",
        timezone: "Europe/London",
        tagline: llm.tagline ?? undefined,
        greeting: llm.greeting,
        services: llm.services,
        hours,
        theme: mergedTheme,
        slotDurationMin: 30,
      };
    } catch (err) {
      console.warn("[extract] LLM refinement failed, using deterministic fallback:", err);
    }
  }

  // --- Deterministic-only path ---
  return {
    slug: "",
    name: fallbackName,
    description: description || metaDescription || "",
    timezone: "Europe/London",
    tagline: undefined,
    greeting: fallbackGreeting,
    services: fallbackServices,
    hours: fallbackHours,
    theme: deterministicTheme,
    slotDurationMin: 30,
  };
}
