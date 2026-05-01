export default function PartnerApplicationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Applications</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Review applicant submissions for partner observership programs.
        </p>
      </header>
      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">Coming soon</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Application queue</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Applicant profiles, documents, status, and review actions will appear here once partner
          program applications are connected.
        </p>
      </section>
    </div>
  );
}
