import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfilePanel } from "./profile-panel";

export default async function DoctorProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/profile");
  if (user.user_metadata?.role !== "applicant") redirect("/login?error=wrong_role");

  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("applicant_profiles")
    .select("email, full_name, details, documents")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <ProfilePanel
      email={data?.email ?? user.email ?? ""}
      fullName={data?.full_name ?? user.user_metadata?.full_name ?? ""}
      initialDetails={(data?.details ?? {}) as Record<string, unknown>}
      initialDocuments={(data?.documents ?? {}) as Record<string, unknown>}
    />
  );
}
