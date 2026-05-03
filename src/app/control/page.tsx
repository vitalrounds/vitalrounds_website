import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ControlHomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pendingApplicants = 0;
  try {
    const admin = createServiceRoleClient();
    const { count } = await admin
      .from("program_applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "reviewing"]);
    pendingApplicants = count ?? 0;
  } catch {
    pendingApplicants = 0;
  }

  const stats = [
    { label: "Active applicants", value: 0 },
    { label: "Pending applicants", value: pendingApplicants },
    { label: "Programs available", value: 0 },
    { label: "Active programs", value: 0 },
    { label: "Payment pending", value: 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Internal operations overview for applicants, programs, partners, and payments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => (
          <section key={item.label} className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Active enrollments</h2>
          <p className="mt-2 text-sm leading-7 text-[#a6ccac]">
            Active enrolled applicants will appear here once enrollment tracking is enabled.
          </p>
        </section>
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Available Programs</h2>
          <p className="mt-2 text-sm leading-7 text-[#a6ccac]">
            Published observership programs will appear here once program management is enabled.
          </p>
        </section>
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Signed in as</h2>
          <p className="mt-2 text-sm text-[#cbecd0]">{user?.email}</p>
        </section>
        <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
          <h2 className="text-lg font-semibold text-white">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#a6ccac]">
            <li>
              —{" "}
              <Link
                href="/control/applicants/waitlist"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Wait list applications
              </Link>
            </li>
            <li>
              —{" "}
              <Link
                href="/control/sales/brochures"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Sales brochures
              </Link>
            </li>
            <li>— Hospital accounts (coming soon)</li>
            <li>
              —{" "}
              <Link
                href="/control/programs"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Our Programs
              </Link>
            </li>
            <li>
              —{" "}
              <Link
                href="/control/payments"
                className="font-medium text-[#cbecd0] underline-offset-2 hover:text-white hover:underline"
              >
                Payments
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
