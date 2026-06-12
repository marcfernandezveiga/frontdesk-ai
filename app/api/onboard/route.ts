/**
 * POST /api/onboard
 * Body: { url: string, description: string }
 * Returns: a draft TenantConfig (slug is empty, assigned on publish)
 *
 * Never throws to the client. Any failure returns a usable draft on DEFAULT_THEME.
 */

import { NextRequest } from "next/server";
import type { TenantConfig } from "@/lib/tenant";
import { DEFAULT_THEME } from "@/lib/tenant";
import { extractBrand } from "@/lib/extract";

export async function POST(request: NextRequest) {
  let url = "";
  let description = "";

  try {
    const body = (await request.json()) as { url?: string; description?: string };
    url = (body.url ?? "").trim();
    description = (body.description ?? "").trim();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  // Normalise: add https:// if missing
  const normalisedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    const draft = await extractBrand({ url: normalisedUrl, description });
    return Response.json(draft);
  } catch (err) {
    // Absolute last-resort fallback. Should not reach here because extractBrand never throws.
    console.error("[onboard] Unexpected error:", err);
    const fallback: TenantConfig = {
      slug: "",
      name: new URL(normalisedUrl).hostname.replace(/^www\./, ""),
      description,
      timezone: "Europe/London",
      greeting: "Hello, how can I help you today?",
      services: [{ name: "Consultation" }],
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
    return Response.json(fallback);
  }
}
