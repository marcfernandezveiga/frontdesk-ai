import { Auth0Client } from "@auth0/nextjs-auth0/server";

/**
 * Auth0 client: reads AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
 * AUTH0_SECRET, and APP_BASE_URL from env. When AUTH0_DOMAIN is absent the
 * client is still instantiated but will throw on real auth flows, which is
 * fine because the middleware + dashboard guard are both no-ops in dev mode.
 */
export const auth0 = new Auth0Client();
