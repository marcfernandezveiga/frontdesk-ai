"use client";

/**
 * /onboard: real driver for the setup flow.
 *
 * State machine: input -> extracting -> preview -> published
 *
 * input:      user enters URL + description
 * extracting: POST /api/onboard runs; phases tick as the request resolves
 * preview:    draft TenantConfig is shown; user can edit inline
 * published:  POST /api/businesses confirms; slug-based links are shown
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { OnboardingFlow } from "@/components/onboarding";
import type { OnboardingStep, ExtractionPhase } from "@/components/onboarding";
import type { TenantConfig, Schedule } from "@/lib/tenant";
import { DEFAULT_THEME, DEFAULT_SCHEDULE } from "@/lib/tenant";
import { countSlotsPerWeek } from "@/lib/schedule";

// Phases shown during extraction. The last one flips done when the API resolves.
const INITIAL_PHASES: ExtractionPhase[] = [
  { label: "Reading your site", done: false },
  { label: "Pulling brand colors and logo", done: false },
  { label: "Writing services and greeting", done: false },
  { label: "Building your receptionist", done: false },
];

// Minimum time (ms) each phase is visible before flipping done
const PHASE_STEP_MS = 2800;

// Default draft shown if extraction fails outright (should not happen, API
// is designed to always return a usable draft)
function fallbackDraft(url: string, description: string): TenantConfig {
  let hostname = url;
  try {
    hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .split(".")[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    // keep as-is
  }
  return {
    slug: "",
    name: hostname,
    description,
    timezone: "Europe/London",
    greeting: `Hello, thanks for calling ${hostname}. How can I help you today?`,
    services: [{ name: "Consultation" }],
    hours: {
      0: null,
      1: { open: "09:00", close: "17:00" },
      2: { open: "09:00", close: "17:00" },
      3: { open: "09:00", close: "17:00" },
      4: { open: "09:00", close: "17:00" },
      5: { open: "09:00", close: "17:00" },
      6: null,
    },
    schedule: DEFAULT_SCHEDULE,
    theme: { ...DEFAULT_THEME },
    slotDurationMin: 30,
  };
}

export default function OnboardPage() {
  const [step, setStep] = useState<OnboardingStep>("input");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  // Extraction state
  const [phases, setPhases] = useState<ExtractionPhase[]>(INITIAL_PHASES);
  const [progress, setProgress] = useState(0);
  const [extractError, setExtractError] = useState<string | undefined>();
  const extractionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store resolved draft here once API call completes
  const pendingDraftRef = useRef<TenantConfig | null>(null);

  // Preview / draft
  const [draft, setDraft] = useState<TenantConfig>(fallbackDraft("", ""));
  const [publishing, setPublishing] = useState(false);

  // Published
  const [publishedSlug, setPublishedSlug] = useState("");

  // ─── Extraction orchestration ──────────────────────────────────────────────
  //
  // When step enters "extracting":
  //  1. Fire POST /api/onboard immediately (async, no await blocking UI).
  //  2. Tick phases on a fixed cadence so the user sees progress.
  //  3. When the API resolves AND we have reached the last phase, flip done and
  //     advance to preview. If the API finishes before the phases, wait for
  //     the final phase tick. If the phases finish before the API, wait for the
  //     API (progress stalls at 0.97).

  useEffect(() => {
    if (step !== "extracting") return;

    let cancelled = false;
    pendingDraftRef.current = null;

    // Start the real API call
    const apiPromise = fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}`, description }),
    })
      .then(async (res) => {
        const data = await res.json() as TenantConfig;
        return data;
      })
      .catch(() => fallbackDraft(url, description));

    // Tick phases sequentially
    const delays = [PHASE_STEP_MS, PHASE_STEP_MS, PHASE_STEP_MS, PHASE_STEP_MS];
    let cumulative = 0;
    let phasesResolved = false;

    delays.forEach((delay, i) => {
      cumulative += delay;
      extractionRef.current = setTimeout(() => {
        if (cancelled) return;
        setPhases((prev) =>
          prev.map((p, j) => (j <= i ? { ...p, done: true } : p))
        );
        if (i === delays.length - 1) {
          phasesResolved = true;
          // Check if API is already done
          if (pendingDraftRef.current) {
            const resolved = pendingDraftRef.current;
            setTimeout(() => {
              if (!cancelled) {
                setProgress(1);
                setDraft(resolved);
                setStep("preview");
              }
            }, 350);
          }
          // Otherwise the apiPromise handler below will advance the step
        }
      }, cumulative);
    });

    // Animate progress bar continuously
    const startTime = Date.now();
    const totalAnimMs = cumulative + 500; // runs slightly past last phase
    const tick = () => {
      if (cancelled) return;
      const t = (Date.now() - startTime) / totalAnimMs;
      setProgress(Math.min(t, 0.97));
      if (t < 1.1) extractionRef.current = setTimeout(tick, 60);
    };
    extractionRef.current = setTimeout(tick, 60);

    // Handle API resolution
    apiPromise.then((resolvedDraft) => {
      if (cancelled) return;
      pendingDraftRef.current = resolvedDraft;
      if (phasesResolved) {
        // Phases already finished, advance now.
        setTimeout(() => {
          if (!cancelled) {
            setProgress(1);
            setDraft(resolvedDraft);
            setStep("preview");
          }
        }, 350);
      }
      // else: the last phase setTimeout will pick it up
    });

    return () => {
      cancelled = true;
      if (extractionRef.current) clearTimeout(extractionRef.current);
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  // url/description are read at submission time; step is the trigger

  // ─── Input ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const trimmedUrl = url.trim();
    const trimmedDesc = description.trim();
    if (!trimmedUrl) {
      setInputError("Enter a website URL.");
      return;
    }
    if (!trimmedDesc) {
      setInputError("Add a one-line description of the business.");
      return;
    }
    setInputError(undefined);
    setExtractError(undefined);
    setPhases(INITIAL_PHASES.map((p) => ({ ...p, done: false })));
    setProgress(0);
    setStep("extracting");
  }, [url, description]);

  const handleCancel = useCallback(() => {
    setStep("input");
    setPhases(INITIAL_PHASES.map((p) => ({ ...p, done: false })));
    setProgress(0);
    setExtractError(undefined);
    pendingDraftRef.current = null;
  }, []);

  // ─── Preview edits ─────────────────────────────────────────────────────────

  const handleNameChange = useCallback((v: string) => {
    setDraft((d) => ({ ...d, name: v }));
  }, []);

  const handleTaglineChange = useCallback((v: string) => {
    setDraft((d) => ({ ...d, tagline: v }));
  }, []);

  const handleGreetingChange = useCallback((v: string) => {
    setDraft((d) => ({ ...d, greeting: v }));
  }, []);

  const handleServiceChange = useCallback((i: number, name: string) => {
    setDraft((d) => {
      const services = [...d.services];
      services[i] = { name };
      return { ...d, services };
    });
  }, []);

  const handleServiceAdd = useCallback(() => {
    setDraft((d) => ({ ...d, services: [...d.services, { name: "" }] }));
  }, []);

  const handleServiceRemove = useCallback((i: number) => {
    setDraft((d) => ({
      ...d,
      services: d.services.filter((_, j) => j !== i),
    }));
  }, []);

  // ─── Schedule ──────────────────────────────────────────────────────────────

  const handleScheduleChange = useCallback((schedule: Schedule) => {
    setDraft((d) => ({ ...d, schedule }));
  }, []);

  // ─── Publish (called from schedule step onContinue) ────────────────────────

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        console.error("[onboard/publish]", err);
        // Still advance, slug is derivable from name even if API hiccups.
      }
      const { slug } = (res.ok ? await res.json().catch(() => ({})) : {}) as { slug?: string };
      const finalSlug = slug ?? draft.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      setPublishedSlug(finalSlug);
      setStep("published");
    } catch (err) {
      console.error("[onboard/publish] Network error:", err);
      const fallbackSlug = draft.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
      setPublishedSlug(fallbackSlug);
      setStep("published");
    } finally {
      setPublishing(false);
    }
  }, [draft]);

  // ─── Start over ────────────────────────────────────────────────────────────

  const handleStartOver = useCallback(() => {
    setStep("input");
    setUrl("");
    setDescription("");
    setPhases(INITIAL_PHASES.map((p) => ({ ...p, done: false })));
    setProgress(0);
    setExtractError(undefined);
    setPublishedSlug("");
    pendingDraftRef.current = null;
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

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
        error: extractError,
        onCancel: handleCancel,
      }}
      previewProps={{
        draft,
        onNameChange: handleNameChange,
        onTaglineChange: handleTaglineChange,
        onGreetingChange: handleGreetingChange,
        onServiceChange: handleServiceChange,
        onServiceAdd: handleServiceAdd,
        onServiceRemove: handleServiceRemove,
        publishing: false,
        onPublish: () => setStep("schedule"),
        onBack: () => setStep("input"),
      }}
      scheduleProps={{
        schedule: draft.schedule,
        onChange: handleScheduleChange,
        slotsPerWeek: countSlotsPerWeek(draft.schedule),
        publishing,
        onBack: () => setStep("preview"),
        onContinue: handlePublish,
      }}
      publishedProps={{
        slug: publishedSlug,
        businessName: draft.name,
        onStartOver: handleStartOver,
      }}
    />
  );
}
