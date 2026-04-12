import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isEmailAllowedAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw.trim()) return true;
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

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
    to.cookies.set(c.name, c.value);
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const host = getHost(request);
  const pathname = request.nextUrl.pathname;
  const onControlHost = isControlHost(host);

  const redirectWithSession = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
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
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/control";
    return redirectWithSession(url);
  }

  if (pathname.startsWith("/control")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return redirectWithSession(url);
    }
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "admin_only");
      return redirectWithSession(url);
    }
    if (!isEmailAllowedAdmin(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "admin_only");
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
    if (role !== "provider") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "wrong_role");
      return redirectWithSession(url);
    }
  }

  return supabaseResponse;
}
