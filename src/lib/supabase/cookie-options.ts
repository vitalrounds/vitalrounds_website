import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Optional shared cookie domain so auth works across subdomains (e.g. www + control).
 * Set in production to `.yourdomain.com` (leading dot is fine). Omit on localhost.
 */
export function getSupabaseCookieOptions(): CookieOptionsWithName | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (!domain) return undefined;
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain,
  };
}
