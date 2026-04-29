import Link from "next/link";
import { ApplicantsTabs } from "../applicants-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pending Applicants | VitalRounds Control",
};

export default function PendingApplicantsPage() {
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
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Pending applicant records will appear here once placement workflow statuses are enabled.
        </p>
      </section>
    </div>
  );
}
