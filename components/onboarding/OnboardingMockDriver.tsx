"use client";

/**
 * OnboardingMockDriver
 *
 * Wave 1 demo harness: drives the OnboardingFlow with simulated extraction
 * and mock TenantConfig data. Drop this into app/onboard/page.tsx until
 * wave 2 wires real API calls.
 *
 * Usage:
 *   import { OnboardingMockDriver } from "@/components/onboarding/OnboardingMockDriver";
 *   export default function OnboardPage() { return <OnboardingMockDriver />; }
 */

import { useState, useEffect, useRef } from "react";
import { OnboardingFlow } from "./OnboardingFlow";
import { DEFAULT_THEME } from "@/lib/tenant";
import type { OnboardingStep, ExtractionPhase } from "./OnboardingTypes";
import type { TenantConfig } from "@/lib/tenant";

// ─── Mock tenant — simulates a brand extracted from a physio site ─────────────

const MOCK_DRAFT: TenantConfig = {
  slug: "demo-preview",
  name: "North London Physio",
  description: "A friendly physiotherapy clinic in Islington",
  timezone: "Europe/London",
  tagline: "Book a physio session today. No waiting lists.",
  greeting:
    "Hi, you've reached North London Physio. I can help you book an appointment. What service are you looking for?",
  services: [
    { name: "Sports injury rehab" },
    { name: "Back and neck pain" },
    { name: "Post-surgery recovery" },
    { name: "Dry needling" },
  ],
  hours: {
    1: { open: "09:00", close: "17:00" },
    2: { open: "09:00", close: "17:00" },
    3: { open: "09:00", close: "17:00" },
    4: { open: "09:00", close: "17:00" },
    5: { open: "09:00", close: "14:00" },
  },
  theme: {
    bg: "#f8f4f0",
    fg: "#1a1410",
    accent: "#c97d3a",
    accentFg: "#ffffff",
    muted: "#7a6a5a",
    border: "#e0d5c8",
    radius: "10px",
    fontSans: "Georgia, serif",
  },
  slotDurationMin: 45,
};

const EXTRACTION_PHASES: ExtractionPhase[] = [
  { label: "Reading your site", done: false },
  { label: "Pulling brand colors and logo", done: false },
  { label: "Writing services and greeting", done: false },
  { label: "Building your receptionist", done: false },
];

export function OnboardingMockDriver() {
  const [step, setStep] = useState<OnboardingStep>("input");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  // Extraction simulation
  const [phases, setPhases] = useState<ExtractionPhase[]>(EXTRACTION_PHASES);
  const [progress, setProgress] = useState(0);
  const extractionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preview editing
  const [draft, setDraft] = useState<TenantConfig>(MOCK_DRAFT);
  const [publishing, setPublishing] = useState(false);

  // Published
  const [publishedSlug, setPublishedSlug] = useState("demo-preview");

  // ── Extraction simulation ──────────────────────────────────────────────────

  useEffect(() => {
    if (step !== "extracting") return;

    const durations = [3500, 2500, 3000, 2500]; // ms per phase
    let elapsed = 0;
    const total = durations.reduce((a, b) => a + b, 0);

    // Animate progress continuously
    const start = Date.now();
    const tick = () => {
      const t = (Date.now() - start) / total;
      setProgress(Math.min(t, 0.98));
      if (t < 1) extractionRef.current = setTimeout(tick, 60);
    };
    extractionRef.current = setTimeout(tick, 60);

    // Mark phases done sequentially
    let cumulative = 0;
    durations.forEach((dur, i) => {
      cumulative += dur;
      extractionRef.current = setTimeout(() => {
        setPhases((prev) =>
          prev.map((p, j) => (j === i ? { ...p, done: true } : p))
        );
        // All done → move to preview
        if (i === durations.length - 1) {
          setTimeout(() => {
            setProgress(1);
            setDraft({ ...MOCK_DRAFT, name: url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "").split(".")[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : MOCK_DRAFT.name });
            setStep("preview");
          }, 400);
        }
      }, cumulative);
    });

    return () => {
      if (extractionRef.current) clearTimeout(extractionRef.current);
    };
  }, [step, url]);

  // ── Input submission ───────────────────────────────────────────────────────

  function handleSubmit() {
    if (!url.trim()) {
      setInputError("Please enter a website URL.");
      return;
    }
    if (!description.trim()) {
      setInputError("Please add a one-line description.");
      return;
    }
    setInputError(undefined);
    setPhases(EXTRACTION_PHASES.map((p) => ({ ...p, done: false })));
    setProgress(0);
    setStep("extracting");
  }

  // ── Preview edits ──────────────────────────────────────────────────────────

  function handleNameChange(v: string) {
    setDraft((d) => ({ ...d, name: v }));
  }

  function handleTaglineChange(v: string) {
    setDraft((d) => ({ ...d, tagline: v }));
  }

  function handleGreetingChange(v: string) {
    setDraft((d) => ({ ...d, greeting: v }));
  }

  function handleServiceChange(i: number, name: string) {
    setDraft((d) => {
      const services = [...d.services];
      services[i] = { name };
      return { ...d, services };
    });
  }

  function handleServiceAdd() {
    setDraft((d) => ({ ...d, services: [...d.services, { name: "" }] }));
  }

  function handleServiceRemove(i: number) {
    setDraft((d) => ({
      ...d,
      services: d.services.filter((_, j) => j !== i),
    }));
  }

  // ── Publish ────────────────────────────────────────────────────────────────

  async function handlePublish() {
    setPublishing(true);
    // Wave 1: simulate a 1.2s publish
    await new Promise((r) => setTimeout(r, 1200));
    const slug = draft.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setPublishedSlug(slug);
    setPublishing(false);
    setStep("published");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <OnboardingFlow
      step={step}
      inputProps={{
        url,
        onUrlChange: setUrl,
        description,
        onDescriptionChange: setDescription,
        loading: false,
        error: inputError,
        onSubmit: handleSubmit,
      }}
      extractingProps={{
        url,
        phases,
        progress,
        onCancel: () => {
          setStep("input");
          setPhases(EXTRACTION_PHASES.map((p) => ({ ...p, done: false })));
          setProgress(0);
        },
      }}
      previewProps={{
        draft,
        onNameChange: handleNameChange,
        onTaglineChange: handleTaglineChange,
        onGreetingChange: handleGreetingChange,
        onServiceChange: handleServiceChange,
        onServiceAdd: handleServiceAdd,
        onServiceRemove: handleServiceRemove,
        publishing,
        onPublish: handlePublish,
        onBack: () => setStep("input"),
      }}
      publishedProps={{
        slug: publishedSlug,
        businessName: draft.name,
        onStartOver: () => {
          setStep("input");
          setUrl("");
          setDescription("");
          setDraft(MOCK_DRAFT);
          setPhases(EXTRACTION_PHASES.map((p) => ({ ...p, done: false })));
          setProgress(0);
        },
      }}
    />
  );
}
