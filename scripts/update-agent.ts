/**
 * Update the shared ElevenLabs ConvAI agent to:
 *  1. Enable prompt + first_message overrides (so /c/[slug] can inject per-tenant prompts)
 *  2. Set a generic receptionist base prompt (not Marina-specific)
 *  3. Keep the two client tools (check_availability, book_appointment)
 *
 * Usage:
 *   npx tsx scripts/update-agent.ts
 *
 * Requires:
 *   ELEVENLABS_API_KEY and NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY is not set.");
  process.exit(1);
}

if (!AGENT_ID) {
  console.error("ERROR: NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set.");
  console.error("Run scripts/create-agent.ts first to create the agent.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Base prompt template — generic receptionist, not business-specific.
// /c/[slug] will override this with the real tenant name/services/hours.
// ---------------------------------------------------------------------------

const BASE_PROMPT = `\
You are a professional front-desk receptionist for {{business_name}}.

Your job is to help callers book appointments quickly and pleasantly.

Rules you MUST follow:
1. ALWAYS call check_availability before mentioning any specific time slots. Never invent or guess slot times.
2. Only offer slots that check_availability returns. If no slots are available, apologise and ask the caller to try again later.
3. When the caller chooses a slot, confirm their full name and the reason for their visit, then call book_appointment.
4. Read back the confirmation line word-for-word once it is returned from book_appointment.
5. Keep responses short — this is a voice call. One or two sentences per turn.
6. Be warm, calm, and professional. Never rush the caller.
7. If the caller asks something unrelated to booking (medical advice, directions, general questions), politely redirect them to booking.

Services offered:
{{services}}

Hours:
{{hours}}
`;

const BASE_FIRST_MESSAGE = "Hello, thanks for calling {{business_name}}. How can I help you today?";

// ---------------------------------------------------------------------------
// Client tools (same across all tenants)
// ---------------------------------------------------------------------------

const CLIENT_TOOLS = [
  {
    type: "client",
    name: "check_availability",
    description:
      "Check available appointment slots. " +
      "Always call this before offering any times to the caller. " +
      "Pass a date string (e.g. 'thursday' or '2026-06-15') if the caller mentions a specific day.",
    expects_response: true,
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description:
            "Optional: a day the caller mentioned, e.g. 'thursday' or '2026-06-15'. " +
            "Omit if the caller did not specify a day.",
        },
      },
      required: [],
    },
  },
  {
    type: "client",
    name: "book_appointment",
    description:
      "Book a specific appointment slot for the caller. " +
      "Only call this after check_availability has returned slots and the caller has chosen one. " +
      "Pass the exact slot_id from check_availability — never invent an id.",
    expects_response: true,
    parameters: {
      type: "object",
      properties: {
        slot_id: {
          type: "string",
          description: "The slot_id returned by check_availability.",
        },
        caller_name: {
          type: "string",
          description: "Full name of the caller as they stated it.",
        },
        reason: {
          type: "string",
          description: "Brief reason for the visit, e.g. 'lower back pain' or 'knee injury follow-up'.",
        },
      },
      required: ["slot_id", "caller_name", "reason"],
    },
  },
];

// ---------------------------------------------------------------------------
// Patch payload
// The overrides.enable_custom_prompt + overrides.enable_custom_first_message
// flags tell ElevenLabs to accept session-level overrides from the browser SDK.
// ---------------------------------------------------------------------------

const patchPayload = {
  conversation_config: {
    agent: {
      first_message: BASE_FIRST_MESSAGE,
      prompt: {
        prompt: BASE_PROMPT,
        llm: "gpt-4o-mini",
        temperature: 0.4,
        tools: CLIENT_TOOLS,
      },
      overrides: {
        custom_llm_extra_body: { enabled: false },
        // These two flags enable startSession({ overrides: { agent: { prompt, firstMessage } } })
        // from the ElevenLabs React SDK on the browser.
        enable_custom_prompt: true,
        enable_custom_first_message: true,
      },
    },
    tts: {
      model_id: "eleven_flash_v2",
    },
  },
};

// ---------------------------------------------------------------------------
// Patch agent
// ---------------------------------------------------------------------------

async function updateAgent() {
  console.log(`Updating ElevenLabs agent ${AGENT_ID}...\n`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      method: "PATCH",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchPayload),
    }
  );

  const json = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    console.error("ElevenLabs API error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("Agent updated successfully.");
  console.log(`  Agent ID: ${AGENT_ID}`);
  console.log(`  Dynamic variables enabled for business_name, services, hours`);
}

updateAgent().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
