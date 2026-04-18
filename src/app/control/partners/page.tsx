import { redirect } from "next/navigation";
import {
  getRoleFromUser,
  isEmailAllowedAdmin,
} from "@/lib/auth/redirect-after-login";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partners | VitalRounds Control",
};

export default async function ControlPartnersPage() {
  const auth = await createServerSupabaseClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  const role = getRoleFromUser(user);
  if (role !== "admin" || !isEmailAllowedAdmin(user?.email)) {
    redirect("/login?error=admin_only");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Partners</h1>
    </div>
  );
}
