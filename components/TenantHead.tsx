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
  fontUrl,
}: {
  name?: string;
  logoUrl?: string;
  fontUrl?: string;
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

  useEffect(() => {
    if (!fontUrl) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [fontUrl]);

  return null;
}
