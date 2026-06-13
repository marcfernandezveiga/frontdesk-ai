"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party page-view tracker. Generates a persistent visitor id (localStorage)
 * and a per-tab session id (sessionStorage), then logs each navigation to
 * /api/track. Renders nothing. Fully best-effort, never throws.
 */
function getOrCreate(key: string, store: Storage): string {
  let v = store.getItem(key);
  if (!v) {
    v =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.round(Math.random() * 1e9);
    store.setItem(key, v);
  }
  return v;
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const visitorId = getOrCreate("fd_vid", window.localStorage);
      const sessionId = getOrCreate("fd_sid", window.sessionStorage);
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          sessionId,
          path: pathname,
          referrer: document.referrer || null,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
