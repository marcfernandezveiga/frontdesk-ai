/**
 * POST /api/businesses
 * Body: TenantConfig (slug may be empty, we assign one from name)
 * Returns: { slug: string }
 *
 * Upserts the business row and seeds availability slots from schedule for the
 * next 14 days. On re-publish, deletes future unbooked slots first so the
 * grid reflects the updated schedule without losing booked slots.
 */

import { NextRequest } from "next/server";
import type { TenantConfig } from "@/lib/tenant";
import { DEFAULT_SCHEDULE } from "@/lib/tenant";
import { generateSlots } from "@/lib/schedule";
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

  const slug =
    config.slug && config.slug.trim() ? config.slug.trim() : slugify(config.name);

  const schedule = config.schedule ?? DEFAULT_SCHEDULE;
  const timezone = config.timezone ?? "Europe/London";

  const business = {
    slug,
    name: config.name,
    description: config.description ?? "",
    timezone,
    tagline: config.tagline ?? null,
    greeting:
      config.greeting ?? `Hello, thanks for calling ${config.name}. How can I help?`,
    services: config.services ?? [],
    hours: config.hours ?? {},
    theme: config.theme ?? {},
    slot_duration_min: schedule.slotDurationMin,
    schedule,
  };

  if (!hasSupabaseEnv) {
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

    // On re-publish: delete future unbooked slots so they are replaced.
    // Keep booked slots intact.
    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteErr } = await (supabase as any)
      .from("slots")
      .delete()
      .eq("business_id", slug)
      .eq("is_booked", false)
      .gt("starts_at", now);

    if (deleteErr) {
      console.warn("[businesses] Slot cleanup error:", deleteErr);
    }

    // Generate 14 days of slots from the schedule
    const generated = generateSlots(schedule, timezone, { days: 14 });

    if (generated.length > 0) {
      const slotRows = generated.map(({ startsAtUtc, durationMin }) => ({
        business_id: slug,
        starts_at: startsAtUtc,
        duration_min: durationMin,
        is_booked: false,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: slotsErr } = await (supabase as any)
        .from("slots")
        .upsert(slotRows, { onConflict: "business_id,starts_at", ignoreDuplicates: true })
        .select("id");

      if (slotsErr) {
        console.warn("[businesses] Slot seeding error:", slotsErr);
      }
    }

    return Response.json({ slug });
  } catch (err) {
    console.error("[businesses] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
