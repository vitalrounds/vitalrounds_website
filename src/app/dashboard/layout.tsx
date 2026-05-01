import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DoctorPortalShell } from "./dashboard-shell";

export default async function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) redirect("/login?next=/dashboard");
  if (user.user_metadata?.role !== "applicant") redirect("/login?error=wrong_role");

  let status = "pending_email_verification";
  let fullName = user.user_metadata?.full_name as string | undefined;
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("applicant_profiles")
      .select("status, full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    fullName = data?.full_name ?? fullName;
    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    const verified = Boolean(authUser.user?.email_confirmed_at ?? user.email_confirmed_at);
    if (verified && data?.status !== "active") {
      await admin
        .from("applicant_profiles")
        .update({
          status: "active",
          email_verified_at: authUser.user?.email_confirmed_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      status = "active";
    } else {
      status = data?.status ?? (verified ? "active" : "pending_email_verification");
    }
  } catch {
    status = user.email_confirmed_at ? "active" : "pending_email_verification";
  }

  if (status !== "active") {
    return (
      <main className="min-h-screen bg-[#0f1f14] px-6 py-16 text-[#cbecd0]">
        <section className="mx-auto max-w-2xl rounded-3xl border border-[#354a38] bg-[#1a2b1e] p-8 text-center">
          <h1 className="text-3xl font-semibold text-white">Pending email verification</h1>
          <p className="mt-3 text-sm leading-7 text-[#a6ccac]">
            Please open the verification email sent to {user.email} and click the link to activate
            your doctor portal. Once verified, your dashboard pages will unlock automatically.
          </p>
          <a href="/auth/sign-out" className="mt-6 inline-flex rounded-full border border-[#5f7362] px-5 py-2 text-sm font-semibold">
            Sign out
          </a>
        </section>
      </main>
    );
  }

  return <DoctorPortalShell userName={fullName ?? user.email ?? "Doctor"}>{children}</DoctorPortalShell>;
}
