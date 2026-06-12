/**
 * Provider abstraction for the AI SDK.
 *
 * Priority order:
 *  1. OPENAI_API_KEY        -> @ai-sdk/openai  (text + vision)
 *  2. GOOGLE_GENERATIVE_AI_API_KEY -> @ai-sdk/google (text + vision)
 *  3. AI_GATEWAY_API_KEY    -> @ai-sdk/gateway (text only, no vision)
 *  4. none -> null (LLM step is skipped)
 *
 * Export surface:
 *  hasLLM()     -> boolean
 *  getModel()   -> LanguageModelV1 (text)
 *  getVisionModel() -> LanguageModelV1 (vision-capable, falls back to text model)
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGateway } from "@ai-sdk/gateway";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = any;

type Provider = "openai" | "google" | "gateway" | "none";

function detectProvider(): Provider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "google";
  if (process.env.AI_GATEWAY_API_KEY) return "gateway";
  return "none";
}

const PROVIDER = detectProvider();

/** Returns true if any LLM provider is configured. */
export function hasLLM(): boolean {
  return PROVIDER !== "none";
}

/**
 * Returns a text-capable language model for the configured provider.
 * Throws if no provider is configured — check hasLLM() first.
 */
export function getModel(): AnyModel {
  switch (PROVIDER) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai("gpt-4o-mini") ;
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return google("gemini-2.0-flash") ;
    }
    case "gateway": {
      const gateway = createGateway({
        apiKey: process.env.AI_GATEWAY_API_KEY,
      });
      return gateway("openai/gpt-4o-mini") ;
    }
    default:
      throw new Error("No LLM provider configured. Check hasLLM() before calling getModel().");
  }
}

/**
 * Returns a vision-capable model. Falls back to getModel() for gateway
 * (gateway has no direct vision routing here).
 */
export function getVisionModel(): AnyModel {
  switch (PROVIDER) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai("gpt-4o") ;
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return google("gemini-2.0-flash") ;
    }
    case "gateway": {
      // Gateway doesn't guarantee a vision route here; fall back to text model.
      return getModel();
    }
    default:
      throw new Error("No LLM provider configured. Check hasLLM() before calling getVisionModel().");
  }
}
