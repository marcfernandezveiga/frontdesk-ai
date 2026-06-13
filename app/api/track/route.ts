import { hasSupabaseEnv, createServiceClient } from "@/lib/supabase";

/**
 * POST /api/track
 * Body: { visitorId, sessionId?, path?, referrer? }
 * Records one page view. Server-side so it can write past RLS via the service role.
 * Fire-and-forget from the client; always returns ok so it never disrupts the page.
 */
export async function POST(request: Request) {
  if (!hasSupabaseEnv) return Response.json({ ok: true });

  let body: {
    visitorId?: string;
    sessionId?: string;
    path?: string;
    referrer?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const visitorId = body.visitorId?.slice(0, 64);
  if (!visitorId) return Response.json({ ok: false }, { status: 400 });

  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

  try {
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("page_views").insert({
      visitor_id: visitorId,
      session_id: body.sessionId?.slice(0, 64) ?? null,
      path: body.path?.slice(0, 200) ?? null,
      referrer: body.referrer?.slice(0, 300) ?? null,
      user_agent: userAgent,
    });
  } catch {
    // Never let analytics break a request.
  }

  return Response.json({ ok: true });
}
