import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

const supabaseProjectId =
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ??
  process.env.SUPABASE_PROJECT_ID ??
  "jxumcqmagdwyvsanmauw";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  `https://${supabaseProjectId}.supabase.co`;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

function getHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded ?? request.headers.get("host") ?? "";
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function isControlHost(host: string) {
  return host === "control.vitalrounds.com.au" || host.startsWith("control.");
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c);
  });
}

function copyAuthHeaders(from: NextResponse, to: NextResponse) {
  for (const key of ["cache-control", "expires", "pragma"] as const) {
    const value = from.headers.get(key);
    if (value) to.headers.set(key, value);
  }
}

function mergeResponseMeta(from: NextResponse, to: NextResponse) {
  copyCookies(from, to);
  copyAuthHeaders(from, to);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseAnonKey) {
    return supabaseResponse;
  }

  const host = getHost(request);
  const pathname = request.nextUrl.pathname;
  const onControlHost = isControlHost(host);

  // Avoid unnecessary auth refresh churn on API routes.
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  const cookieOptions = getSupabaseCookieOptions();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        }
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const redirectWithSession = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    mergeResponseMeta(supabaseResponse, redirectResponse);
    return redirectResponse;
  };

  if (onControlHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/control";
    return redirectWithSession(url);
  }

  if (
    onControlHost &&
    !pathname.startsWith("/control") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/control";
    return redirectWithSession(url);
  }

  // /control access checks run in the control layout with a server-side guard.

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(url);
    }
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "applicant") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "wrong_role");
      return redirectWithSession(url);
    }
  }

  if (pathname.startsWith("/customer")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(url);
    }
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "customer") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "wrong_role");
      return redirectWithSession(url);
    }
  }

  if (pathname.startsWith("/provider")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(url);
    }
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "provider" && role !== "partner") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "wrong_role");
      return redirectWithSession(url);
    }
  }

  return supabaseResponse;
}
