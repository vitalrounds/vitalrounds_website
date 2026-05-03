import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ApplicantsTabs } from "../applicants-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pending Applicants | VitalRounds Control",
};

type ProgramApplication = {
  id: string;
  applicant_user_id: string;
  program_id: string;
  status: string;
  created_at: string;
};

type ApplicantProfile = {
  user_id: string;
  email: string;
  full_name: string | null;
};

type PendingApplicationRow = ProgramApplication & {
  applicant: ApplicantProfile | null;
};

export default async function PendingApplicantsPage() {
  let rows: PendingApplicationRow[] = [];
  try {
    const admin = createServiceRoleClient();
    const { data: applications } = await admin
      .from("program_applications")
      .select("id, applicant_user_id, program_id, status, created_at")
      .in("status", ["submitted", "reviewing"])
      .order("created_at", { ascending: false });

    const applicationRows = (applications as ProgramApplication[]) ?? [];
    const applicantUserIds = [...new Set(applicationRows.map((row) => row.applicant_user_id))];

    let profilesByUserId = new Map<string, ApplicantProfile>();
    if (applicantUserIds.length > 0) {
      const { data: profiles } = await admin
        .from("applicant_profiles")
        .select("user_id, email, full_name")
        .in("user_id", applicantUserIds);

      profilesByUserId = new Map(
        ((profiles as ApplicantProfile[]) ?? []).map((profile) => [profile.user_id, profile]),
      );
    }

    rows = applicationRows.map((row) => ({
      ...row,
      applicant: profilesByUserId.get(row.applicant_user_id) ?? null,
    }));
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Applicants</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Review program applications that are awaiting selection and approval by the admin and partner.
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
            <p className="text-sm text-[#a6ccac]">No program applicants are pending review.</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-[#354a38] bg-[#1f2d24] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">
                      {row.applicant?.full_name ?? row.applicant?.email ?? "Applicant profile not found"}
                    </p>
                    <p className="text-[#a6ccac]">
                      {row.applicant?.email ?? row.applicant_user_id}
                    </p>
                    <p className="mt-1 text-xs text-[#7a9b80]">
                      Program: {humanizeProgramId(row.program_id)} · Applied{" "}
                      {new Date(row.created_at).toLocaleDateString("en-AU", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-700/60 px-3 py-1 text-xs font-semibold text-amber-100">
                    {humanizeStatus(row.status)}
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

function humanizeStatus(status: string) {
  if (status === "submitted") return "Submitted";
  if (status === "reviewing") return "Under review";
  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanizeProgramId(programId: string) {
  return programId
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
