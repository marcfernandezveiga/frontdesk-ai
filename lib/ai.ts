import { generateText } from "ai";
import { createGateway } from "@ai-sdk/gateway";

// ---------------------------------------------------------------------------
// Vercel AI Gateway client
// ---------------------------------------------------------------------------

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// ---------------------------------------------------------------------------
// summariseTranscript
// Condenses a call transcript into one human-readable line describing
// what the caller wanted, suitable for the dashboard summary column.
// ---------------------------------------------------------------------------

export async function summariseTranscript(transcript: string): Promise<string> {
  const { text } = await generateText({
    model: gateway("openai/gpt-4o-mini"),
    system:
      "You are a concise medical receptionist assistant. " +
      "Given a call transcript, write exactly one sentence (max 20 words) " +
      "describing what the caller wanted. No preamble, no punctuation beyond the period.",
    prompt: transcript,
    maxOutputTokens: 60,
  });

  return text.trim();
}
