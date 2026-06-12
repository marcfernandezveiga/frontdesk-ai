/**
 * GET /api/elevenlabs/token
 *
 * Mints a short-lived WebRTC conversation token for a private ElevenLabs agent.
 * The client uses this token instead of exposing the raw API key.
 *
 * If ELEVENLABS_API_KEY or NEXT_PUBLIC_ELEVENLABS_AGENT_ID are absent, returns
 * a 503 so the caller can fall back to a public (agentId-only) session.
 *
 * ElevenLabs docs: POST /v1/convai/conversation/token
 * Response: { conversation_token: string }
 * The client passes this as `conversationToken` to startSession().
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return Response.json(
      { error: "ElevenLabs env vars not set, use public agentId fallback" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(
        agentId
      )}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[elevenlabs/token] API error:", res.status, text);
      return Response.json(
        { error: "Failed to mint conversation token" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      token?: string;
      conversation_token?: string;
    };
    return Response.json({ token: data.token ?? data.conversation_token });
  } catch (err) {
    console.error("[elevenlabs/token] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
