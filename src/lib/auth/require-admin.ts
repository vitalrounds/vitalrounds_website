import { redirect } from "next/navigation";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Shared control-panel guard for server components.
 *
 * Important: avoid getUser()/refresh flow here because server components cannot
 * reliably persist refreshed auth cookies. Middleware handles refresh writes.
 */
export async function requireAdmin(nextPath = "/control") {
  const auth = await createServerSupabaseClient();
  const {
    data: { session },
  } = await auth.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user.email)) {
    redirect("/login?error=admin_only");
  }

  return user;
}
