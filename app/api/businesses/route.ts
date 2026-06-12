/**
 * POST /api/businesses
 * Body: TenantConfig (slug may be empty, we assign one from name)
 * Returns: { slug: string }
 *
 * Upserts the business row and seeds availability slots from hours for the next 7 days.
 */

import { NextRequest } from "next/server";
import type { TenantConfig, BusinessHours } from "@/lib/tenant";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Slug helpers
// ---------------------------------------------------------------------------

/** Derive a URL-safe slug from a business name. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// Slot seeding
// ---------------------------------------------------------------------------

/**
 * Generate ISO start times for all open slots in the next `days` calendar days
 * based on BusinessHours + slotDurationMin.
 */
function generateSlotTimes(
  hours: BusinessHours,
  slotDurationMin: number,
  timezone: string,
  days = 7
): string[] {
  const slots: string[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);

    // Get day-of-week (0=Sun) in the business timezone
    const dayIndex = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    ).getDay();

    const dayHours = hours[dayIndex];
    if (!dayHours) continue;

    const [openH, openM] = dayHours.open.split(":").map(Number);
    const [closeH, closeM] = dayHours.close.split(":").map(Number);

    // Build slot times in local time, then convert to UTC
    let currentMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    while (currentMin + slotDurationMin <= closeMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;

      // Build a date string in the business timezone, then parse
      const localDateStr = date.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
      const localTimeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

      // Create UTC ISO string by treating the local time
      // We use the Intl approach: create a Date from local parts and read UTC
      const slotLocal = new Date(`${localDateStr}T${localTimeStr}`);
      // Adjust for timezone offset
      const tzOffset = getTimezoneOffsetMs(timezone, slotLocal);
      const slotUtc = new Date(slotLocal.getTime() - tzOffset);

      // Only include future slots
      if (slotUtc > now) {
        slots.push(slotUtc.toISOString());
      }

      currentMin += slotDurationMin;
    }
  }

  return slots;
}

/** Get the UTC offset in ms for a given timezone at a given moment. */
function getTimezoneOffsetMs(tz: string, date: Date): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const localStr = date.toLocaleString("en-US", { timeZone: tz });
  const utcDate = new Date(utcStr);
  const localDate = new Date(localStr);
  return localDate.getTime() - utcDate.getTime();
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let config: Partial<TenantConfig>;

  try {
    config = (await request.json()) as Partial<TenantConfig>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!config.name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  // Assign slug from name if not provided or empty
  const slug = config.slug && config.slug.trim() ? config.slug.trim() : slugify(config.name);

  const business = {
    slug,
    name: config.name,
    description: config.description ?? "",
    timezone: config.timezone ?? "Europe/London",
    tagline: config.tagline ?? null,
    greeting: config.greeting ?? `Hello, thanks for calling ${config.name}. How can I help?`,
    services: config.services ?? [],
    hours: config.hours ?? {},
    theme: config.theme ?? {},
    slot_duration_min: config.slotDurationMin ?? 30,
  };

  if (!hasSupabaseEnv) {
    // Mock path
    return Response.json({ slug });
  }

  try {
    const supabase = createServiceClient();

    // Upsert business row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertErr } = await (supabase as any)
      .from("businesses")
      .upsert(business, { onConflict: "slug" });

    if (upsertErr) {
      console.error("[businesses] Upsert error:", upsertErr);
      return Response.json({ error: "Failed to save business" }, { status: 500 });
    }

    // Seed slots for the next 7 days
    const hours = config.hours ?? {};
    const slotDurationMin = config.slotDurationMin ?? 30;
    const timezone = config.timezone ?? "Europe/London";

    const slotTimes = generateSlotTimes(hours, slotDurationMin, timezone, 7);

    if (slotTimes.length > 0) {
      const slotRows = slotTimes.map((starts_at) => ({
        business_id: slug,
        starts_at,
        duration_min: slotDurationMin,
        is_booked: false,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: slotsErr } = await (supabase as any)
        .from("slots")
        .upsert(slotRows, { onConflict: "business_id,starts_at", ignoreDuplicates: true })
        .select("id");

      if (slotsErr) {
        // Non-fatal: log but don't fail the request
        console.warn("[businesses] Slot seeding error:", slotsErr);
      }
    }

    return Response.json({ slug });
  } catch (err) {
    console.error("[businesses] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
