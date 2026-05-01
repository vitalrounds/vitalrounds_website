import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "customer" | "provider" | "partner" | "applicant";

export function getRoleFromUser(user: User | null): AppRole | null {
  const role = user?.user_metadata?.role;
  if (
    role === "admin" ||
    role === "customer" ||
    role === "provider" ||
    role === "partner" ||
    role === "applicant"
  ) {
    return role;
  }
  return null;
}

export function getPostLoginPath(
  role: AppRole,
  options: { controlOrigin?: string }
) {
  if (role === "admin") {
    if (options.controlOrigin) {
      return `${options.controlOrigin.replace(/\/$/, "")}/control`;
    }
    return "/control";
  }
  if (role === "customer") return "/customer/dashboard";
  if (role === "applicant") return "/dashboard";
  if (role === "provider" || role === "partner") return "/provider/dashboard";
  return "/login";
}

export function isEmailAllowedAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (!raw.trim()) return true;
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
