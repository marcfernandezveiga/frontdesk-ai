/**
 * Lightweight, fail-open rate limiter backed by the `api_calls` Supabase table.
 *
 * Rules:
 *  - If Supabase env vars are missing, always allow (local / demo mode).
 *  - Any unexpected error always allows (never take the app down).
 *  - On every allowed request, a row is inserted so future calls can count it.
 */

import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Returns the best-effort client IP from Vercel's forwarded headers.
 * Falls back to null if nothing is available.
 */
export function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? null;
}

// ---------------------------------------------------------------------------
// Rate-limit check
// ---------------------------------------------------------------------------

export interface RateLimitOpts {
  /** Max calls from one IP to this endpoint in the rolling 60-minute window. */
  perIpPerHour: number;
  /** Max calls from ALL IPs to this endpoint since UTC midnight today. */
  perDayGlobal: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

export async function checkRateLimit(
  endpoint: string,
  ip: string | null,
  opts: RateLimitOpts
): Promise<RateLimitResult> {
  // Fail-open: no Supabase → allow everything (e.g. local dev without env).
  if (!hasSupabaseEnv) {
    return { allowed: true };
  }

  try {
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const now = new Date();

    // --- Per-IP per-hour check -------------------------------------------
    if (ip) {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

      const { count: ipCount, error: ipErr } = await db
        .from("api_calls")
        .select("id", { count: "exact", head: true })
        .eq("endpoint", endpoint)
        .eq("ip", ip)
        .gte("created_at", oneHourAgo);

      if (!ipErr && typeof ipCount === "number" && ipCount >= opts.perIpPerHour) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: max ${opts.perIpPerHour} requests per hour from your IP.`,
        };
      }
    }

    // --- Global per-day check --------------------------------------------
    const utcMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).toISOString();

    const { count: dayCount, error: dayErr } = await db
      .from("api_calls")
      .select("id", { count: "exact", head: true })
      .eq("endpoint", endpoint)
      .gte("created_at", utcMidnight);

    if (!dayErr && typeof dayCount === "number" && dayCount >= opts.perDayGlobal) {
      return {
        allowed: false,
        reason: `Daily limit reached for this service. Please try again tomorrow.`,
      };
    }

    // --- Record this call -------------------------------------------------
    await db.from("api_calls").insert({ endpoint, ip: ip ?? null });

    return { allowed: true };
  } catch {
    // Any unexpected error → fail open so we never break the app.
    return { allowed: true };
  }
}
