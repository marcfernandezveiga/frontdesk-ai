/**
 * Next.js 16 proxy (replaces middleware.ts).
 * Mounts Auth0 SDK routes (/auth/login, /auth/callback, /auth/logout) and
 * gates /dashboard behind login.
 *
 * Dev-mode bypass: when AUTH0_DOMAIN is absent the proxy passes all requests
 * through unchanged so the demo runs without any Auth0 credentials.
 */
import { NextResponse } from "next/server";

export async function proxy(request: Request): Promise<Response> {
  // No-op in dev/demo when Auth0 env vars are absent
  if (!process.env.AUTH0_DOMAIN) {
    return NextResponse.next();
  }

  // Lazy-import so the Auth0Client is only instantiated when env is present
  const { auth0 } = await import("./lib/auth0");
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
