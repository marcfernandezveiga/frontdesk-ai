"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab title to the tenant's business name and swaps the
 * favicon to the tenant's logo. Client-side because the tenant config is
 * fetched in a Client Component. Renders nothing.
 */
export function TenantHead({
  name,
  logoUrl,
}: {
  name?: string;
  logoUrl?: string;
}) {
  useEffect(() => {
    if (name) document.title = name;
  }, [name]);

  useEffect(() => {
    if (!logoUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    const previous = link.href;
    link.href = logoUrl;
    return () => {
      if (link) link.href = previous;
    };
  }, [logoUrl]);

  return null;
}
