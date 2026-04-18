import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRoleFromUser, isEmailAllowedAdmin } from "@/lib/auth/redirect-after-login";

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

function bearerFromRequest(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function requireAdminForApi(req: Request) {
  const auth = await createServerSupabaseClient();
  await auth.auth.getSession();
  const {
    data: { user: verifiedUser },
  } = await auth.auth.getUser();
  const {
    data: { session },
  } = await auth.auth.getSession();

  let user = verifiedUser ?? session?.user ?? null;

  // Fallback: if cookie-based auth is missing in this request context, verify a Bearer token.
  if (!user) {
    const bearer = bearerFromRequest(req);
    if (bearer && supabaseAnonKey) {
      const anon = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const {
        data: { user: bearerUser },
      } = await anon.auth.getUser(bearer);
      user = bearerUser ?? null;
    }
  }

  if (!user) return { ok: false as const, status: 401 };

  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user.email ?? undefined)) {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const };
}
