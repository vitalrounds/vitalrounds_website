import { redirect } from "next/navigation";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Shared control-panel guard. Uses both getUser and session fallback to avoid
 * transient null-user redirects during token refresh windows.
 */
export async function requireAdmin(nextPath = "/control") {
  const auth = await createServerSupabaseClient();
  await auth.auth.getSession();

  const {
    data: { user: verifiedUser },
  } = await auth.auth.getUser();
  const {
    data: { session },
  } = await auth.auth.getSession();

  const user = verifiedUser ?? session?.user ?? null;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user.email)) {
    redirect("/login?error=admin_only");
  }

  return user;
}
