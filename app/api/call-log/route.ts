import { BUSINESS_ID } from "@/lib/types";
import type { CallLog } from "@/lib/types";
import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";
import { summariseTranscript } from "@/lib/ai";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: { transcript?: string; appointment_id?: string; business?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { transcript = "", appointment_id } = body;
  const businessId =
    request.nextUrl.searchParams.get("business") ?? body.business ?? BUSINESS_ID;

  if (!transcript) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  // Generate AI summary best-effort. Do not let it block the save.
  let summary: string | null = null;
  try {
    if (process.env.AI_GATEWAY_API_KEY) {
      summary = await summariseTranscript(transcript);
    }
  } catch (err) {
    console.warn("[call-log] Summary generation failed:", err);
    summary = null;
  }

  if (!hasSupabaseEnv) {
    // --- MOCK PATH ---
    return Response.json({
      id: `mock-log-${Date.now()}`,
      summary,
    });
  }

  // --- REAL SUPABASE PATH ---
  try {
    const supabase = createServiceClient();

    const insertPayload: Omit<CallLog, "id" | "created_at"> = {
      business_id: businessId,
      transcript,
      summary,
      appointment_id: appointment_id ?? null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: logData, error } = await (supabase as any)
      .from("call_logs")
      .insert(insertPayload)
      .select("id")
      .single();

    const log = logData as Pick<CallLog, "id"> | null;

    if (error || !log) {
      console.error("[call-log] Supabase insert error:", error);
      return Response.json({ error: "Failed to save call log" }, { status: 500 });
    }

    return Response.json({ id: log.id, summary });
  } catch (err) {
    console.error("[call-log] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
