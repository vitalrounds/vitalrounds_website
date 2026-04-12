import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createServerSupabaseClient() {
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* ignore when called from Server Component */
        }
      },
    },
  });
}
