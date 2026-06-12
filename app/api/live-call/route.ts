/**
 * POST /api/live-call
 *
 * Stores live phone-call state for the owner dashboard.
 * The current demo writes browser voice calls here. A real Twilio/ElevenLabs
 * phone webhook can write the same events later.
 */

import { NextRequest } from "next/server";
import { BUSINESS_ID } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

type LiveCallEvent = "start" | "update" | "booked" | "end";

interface LiveCallBody {
  event: LiveCallEvent;
  call_id?: string;
  business?: string;
  caller_name?: string;
  caller_phone?: string;
  transcript?: string;
  current_speaker?: "caller" | "agent";
  appointment_id?: string | null;
}

const mockLiveCalls = new Map<string, LiveCallBody & { id: string; status: string }>();

export async function POST(request: NextRequest) {
  let body: LiveCallBody;

  try {
    body = (await request.json()) as LiveCallBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const businessId =
    request.nextUrl.searchParams.get("business") ?? body.business ?? BUSINESS_ID;

  if (!hasSupabaseEnv) {
    const id = body.call_id ?? `mock-call-${Date.now()}`;
    const previous = mockLiveCalls.get(id);
    const next = {
      ...previous,
      ...body,
      id,
      status:
        body.event === "start"
          ? "ringing"
          : body.event === "booked"
            ? "booked"
            : body.event === "end"
              ? "ended"
              : "live",
    };
    mockLiveCalls.set(id, next);
    return Response.json({ id });
  }

  try {
    const supabase = createServiceClient();

    if (body.event === "start") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("live_calls")
        .insert({
          business_id: businessId,
          caller_name: body.caller_name ?? null,
          caller_phone: body.caller_phone ?? "Phone caller",
          status: "ringing",
          transcript: "",
          current_speaker: null,
          appointment_id: null,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("[live-call] start error:", error);
        return Response.json({ error: "Failed to start live call" }, { status: 500 });
      }

      return Response.json({ id: data.id as string });
    }

    if (!body.call_id) {
      return Response.json({ error: "call_id is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.event === "update") {
      update.status = "live";
      update.transcript = body.transcript ?? "";
      update.current_speaker = body.current_speaker ?? null;
      if (body.caller_name) update.caller_name = body.caller_name;
    }

    if (body.event === "booked") {
      update.status = "booked";
      update.transcript = body.transcript ?? "";
      update.current_speaker = "agent";
      update.appointment_id = body.appointment_id ?? null;
      if (body.caller_name) update.caller_name = body.caller_name;
    }

    if (body.event === "end") {
      update.status = "ended";
      update.transcript = body.transcript ?? "";
      update.current_speaker = null;
      update.ended_at = new Date().toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("live_calls")
      .update(update)
      .eq("id", body.call_id)
      .eq("business_id", businessId);

    if (error) {
      console.error("[live-call] update error:", error);
      return Response.json({ error: "Failed to update live call" }, { status: 500 });
    }

    return Response.json({ id: body.call_id });
  } catch (err) {
    console.error("[live-call] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
