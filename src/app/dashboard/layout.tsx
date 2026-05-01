import Link from "next/link";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) redirect("/login?next=/dashboard");
  if (user.user_metadata?.role !== "applicant") redirect("/login?error=wrong_role");

  let status = "pending_email_verification";
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("applicant_profiles")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    status = data?.status ?? (user.email_confirmed_at ? "active" : "pending_email_verification");
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
          <Link href="/auth/sign-out" className="mt-6 inline-flex rounded-full border border-[#5f7362] px-5 py-2 text-sm font-semibold">
            Sign out
          </Link>
        </section>
      </main>
    );
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/programs", label: "Browse Programs" },
    { href: "/dashboard/enrollments", label: "My Enrollments" },
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1f14] text-[#cbecd0]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#223a29] bg-[#132318] p-5 md:block">
        <div className="text-lg font-semibold text-white">VitalRounds — Doctor Portal</div>
        <nav className="mt-10 space-y-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#a6ccac] hover:bg-[#28452f] hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="mx-auto max-w-6xl px-6 py-8 md:ml-64">{children}</main>
    </div>
  );
}
