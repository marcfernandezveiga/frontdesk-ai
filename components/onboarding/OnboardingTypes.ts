/**
 * Onboarding flow types.
 *
 * The flow has five states:
 *   input      → user enters URL + description
 *   extracting → async brand extraction in progress
 *   preview    → draft TenantConfig shown with live branded preview + edit fields
 *   schedule   → owner sets their working hours and slot duration
 *   published  → business is live, shareable link shown
 *
 * All components are presentational and prop-driven.
 * Wave 2 wires real API calls; wave 1 uses mock data.
 */

import type { TenantConfig, BrandTheme, Service, BusinessHours } from "@/lib/tenant";
import type { OnboardingScheduleProps } from "./OnboardingSchedule";

// ─── Flow state ───────────────────────────────────────────────────────────────

export type OnboardingStep = "input" | "extracting" | "preview" | "schedule" | "published";

// ─── Input step ───────────────────────────────────────────────────────────────

export interface OnboardingInputProps {
  /** Controlled URL value */
  url: string;
  onUrlChange: (v: string) => void;
  /** Controlled description value */
  description: string;
  onDescriptionChange: (v: string) => void;
  /** Whether the form is currently submitting */
  loading?: boolean;
  /** Validation or submission error to show inline */
  error?: string;
  /** Called when the user submits the form */
  onSubmit: () => void;
}

// ─── Extracting step ──────────────────────────────────────────────────────────

export interface ExtractionPhase {
  /** Short label shown to the user, e.g. "Reading your site" */
  label: string;
  /** Whether this phase has completed */
  done: boolean;
}

export interface OnboardingExtractingProps {
  /** The URL being processed */
  url: string;
  /** Sequential extraction phases. Wave 2 drives these live; wave 1 uses a timer mock. */
  phases: ExtractionPhase[];
  /** 0–1 progress value. Wave 2 derives from phases; wave 1 animates freely. */
  progress: number;
  /** Error if extraction failed entirely */
  error?: string;
  onCancel?: () => void;
}

// ─── Preview step ─────────────────────────────────────────────────────────────

export interface EditableField {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  /** Hint text shown below the field */
  hint?: string;
}

export interface OnboardingPreviewProps {
  /** Draft config returned from POST /api/onboard */
  draft: TenantConfig;
  /** Called when the user edits the business name */
  onNameChange: (v: string) => void;
  /** Called when the user edits the tagline */
  onTaglineChange: (v: string) => void;
  /** Called when the user edits the greeting */
  onGreetingChange: (v: string) => void;
  /** Called when a service name is edited */
  onServiceChange: (index: number, name: string) => void;
  /** Called to add a new service */
  onServiceAdd: () => void;
  /** Called to remove a service by index */
  onServiceRemove: (index: number) => void;
  /** Whether the publish action is in progress */
  publishing?: boolean;
  /** Called when the user clicks "Publish" */
  onPublish: () => void;
  /** Called to go back to the input step */
  onBack?: () => void;
}

// ─── Published step ───────────────────────────────────────────────────────────

export interface OnboardingPublishedProps {
  /** The live slug assigned on publish */
  slug: string;
  /** Business name, for display */
  businessName: string;
  /** Called to start over with a new business */
  onStartOver?: () => void;
}

// ─── Top-level orchestrator ───────────────────────────────────────────────────

export interface OnboardingFlowProps {
  step: OnboardingStep;
  // Input step
  inputProps: OnboardingInputProps;
  // Extracting step
  extractingProps: OnboardingExtractingProps;
  // Preview step
  previewProps: OnboardingPreviewProps;
  // Schedule step
  scheduleProps: OnboardingScheduleProps;
  // Published step
  publishedProps: OnboardingPublishedProps;
}
