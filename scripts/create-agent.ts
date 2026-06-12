/**
 * Create the Marina Physio ElevenLabs Conversational AI agent.
 *
 * Usage:
 *   npx tsx scripts/create-agent.ts
 *
 * Requires ELEVENLABS_API_KEY in the environment (or .env.local).
 * Prints the created agent_id — put it in NEXT_PUBLIC_ELEVENLABS_AGENT_ID.
 */

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Load .env.local manually (tsx doesn't auto-load it)
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

if (!ELEVENLABS_API_KEY) {
  console.error("ERROR: ELEVENLABS_API_KEY is not set.");
  process.exit(1);
}

const SYSTEM_PROMPT = `\
You are the friendly front-desk receptionist for Marina Physio, a physiotherapy clinic in London.

Your job is to help callers book appointments quickly and pleasantly.

Rules you MUST follow:
1. ALWAYS call check_availability before mentioning any specific time slots. Never invent or guess slot times.
2. Only offer slots that check_availability returns. If no slots are available, apologise and ask the caller to call back during office hours.
3. When the caller chooses a slot, confirm their full name and the reason for their visit, then call book_appointment.
4. Read back the confirmation line word-for-word once it is returned from book_appointment.
5. Keep responses short — this is a voice call. One or two sentences maximum per turn.
6. Be warm, calm, and professional. Never rush the caller.
7. If the caller asks something unrelated to booking (e.g. medical advice, directions), politely redirect them to the appointment booking.

Business details:
- Clinic: Marina Physio
- Location: London, UK
- Appointments: 30-minute slots
`;

const FIRST_MESSAGE =
  "Hello, thanks for calling Marina Physio! How can I help you today?";

// ---------------------------------------------------------------------------
// ElevenLabs ConvAI agent create payload
// POST https://api.elevenlabs.io/v1/convai/agents/create
//
// Payload shape based on the official Python SDK types:
// - conversation_config.agent.prompt.prompt   → system prompt text
// - conversation_config.agent.first_message   → greeting the agent says first
// - conversation_config.agent.prompt.tools    → array of tool objects
//   Each client tool: { type: "client", name, description, parameters, expects_response }
//   parameters is ObjectJsonSchemaProperty: { type: "object", properties: {...}, required: [...] }
//   Each property: { type: "string"|"number"|"boolean"|"integer", description }
// ---------------------------------------------------------------------------

const agentPayload = {
  name: "Marina Physio Receptionist",
  conversation_config: {
    agent: {
      first_message: FIRST_MESSAGE,
      prompt: {
        prompt: SYSTEM_PROMPT,
        llm: "gpt-4o-mini",
        temperature: 0.4,
        tools: [
          {
            type: "client",
            name: "check_availability",
            description:
              "Check available appointment slots at Marina Physio. " +
              "Always call this before offering any times to the caller. " +
              "Pass a date string (e.g. 'thursday' or '2026-06-13') if the caller mentions a specific day.",
            expects_response: true,
            parameters: {
              type: "object",
              properties: {
                date: {
                  type: "string",
                  description:
                    "Optional: a day the caller mentioned, e.g. 'thursday' or '2026-06-13'. " +
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
                  description:
                    "Brief reason for the visit, e.g. 'lower back pain' or 'knee injury follow-up'.",
                },
              },
              required: ["slot_id", "caller_name", "reason"],
            },
          },
        ],
      },
    },
    tts: {
      // Warm, natural British English voice — "Rachel" is a good default.
      // Change this to a voice_id from your ElevenLabs library if preferred.
      model_id: "eleven_turbo_v2_5",
    },
  },
  platform_settings: {
    // Widget settings are optional; safe to omit for the hackathon.
  },
};

// ---------------------------------------------------------------------------
// Create agent
// ---------------------------------------------------------------------------

async function createAgent() {
  console.log("Creating Marina Physio ElevenLabs agent...\n");

  const response = await fetch(
    "https://api.elevenlabs.io/v1/convai/agents/create",
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
    }
  );

  const json = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    console.error("ElevenLabs API error:", JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const agentId = (json.agent_id ?? json.id) as string;

  console.log("✓ Agent created successfully!\n");
  console.log(`  agent_id: ${agentId}\n`);
  console.log("Next step — add this to your .env.local:");
  console.log(`  NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId}\n`);
  console.log(
    "Then redeploy (or restart the dev server) for the browser to pick it up."
  );
}

createAgent().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
