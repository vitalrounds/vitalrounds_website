import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ApplicantsTabs } from "../applicants-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pending Applicants | VitalRounds Control",
};

type ApplicantProfile = {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  created_at: string;
};

export default async function PendingApplicantsPage() {
  let rows: ApplicantProfile[] = [];
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin
      .from("applicant_profiles")
      .select("id, email, full_name, status, created_at")
      .eq("status", "pending_email_verification")
      .order("created_at", { ascending: false });
    rows = (data as ApplicantProfile[]) ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Applicants</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Review applicants who are pending confirmation, placement, or next action.
          </p>
          <ApplicantsTabs active="pending" />
        </div>
        <Link
          href="/control"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Control home
        </Link>
      </div>

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Pending applicants
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Pending review</h2>
        <div className="mt-4 space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-[#a6ccac]">No applicants pending email verification.</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-[#354a38] bg-[#1f2d24] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{row.full_name ?? row.email}</p>
                    <p className="text-[#a6ccac]">{row.email}</p>
                  </div>
                  <span className="rounded-full border border-amber-700/60 px-3 py-1 text-xs font-semibold text-amber-100">
                    Pending Email Verification
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
