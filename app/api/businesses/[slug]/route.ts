/**
 * GET /api/businesses/[slug]
 * Returns a TenantConfig for the given slug.
 */

import { NextRequest } from "next/server";
import type { TenantConfig, BrandTheme, BusinessHours } from "@/lib/tenant";
import { DEFAULT_THEME } from "@/lib/tenant";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// Marina Physio mock for when Supabase is not configured
const MARINA_MOCK: TenantConfig = {
  slug: "marina-physio",
  name: "Marina Physio",
  description:
    "Physiotherapy clinic in London specialising in sports injuries, post-surgery rehab, and chronic pain.",
  timezone: "Europe/London",
  tagline: "Back on your feet, faster.",
  greeting: "Hello, thanks for calling Marina Physio. How can I help you today?",
  services: [
    { name: "Initial assessment" },
    { name: "Sports injury treatment" },
    { name: "Post-surgery rehabilitation" },
    { name: "Chronic pain management" },
    { name: "Massage therapy" },
  ],
  hours: {
    0: null,
    1: { open: "09:00", close: "17:00" },
    2: { open: "09:00", close: "17:00" },
    3: { open: "09:00", close: "17:00" },
    4: { open: "09:00", close: "17:00" },
    5: { open: "09:00", close: "17:00" },
    6: null,
  },
  theme: { ...DEFAULT_THEME },
  slotDurationMin: 30,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!hasSupabaseEnv) {
    if (slug === "marina-physio") {
      return Response.json(MARINA_MOCK);
    }
    return Response.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("businesses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return Response.json({ error: "Business not found" }, { status: 404 });
    }

    // Map DB row to TenantConfig
    const row = data as {
      slug: string;
      name: string;
      description: string;
      timezone: string;
      tagline: string | null;
      greeting: string;
      services: { name: string }[];
      hours: Record<string, { open: string; close: string } | null>;
      theme: Partial<BrandTheme>;
      slot_duration_min: number;
    };

    // Convert hours keys from strings back to numbers
    const hours: BusinessHours = {};
    for (let d = 0; d <= 6; d++) {
      const v = row.hours[String(d)];
      hours[d] = v ?? null;
    }

    const config: TenantConfig = {
      slug: row.slug,
      name: row.name,
      description: row.description,
      timezone: row.timezone,
      tagline: row.tagline ?? undefined,
      greeting: row.greeting,
      services: row.services ?? [],
      hours,
      theme: { ...DEFAULT_THEME, ...row.theme },
      slotDurationMin: row.slot_duration_min,
    };

    return Response.json(config);
  } catch (err) {
    console.error("[businesses/slug] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
