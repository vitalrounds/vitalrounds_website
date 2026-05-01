export default function ProviderDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-white">Partner Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Secure overview for hospital and clinic partners managing observership applications and
          enrolled applicants.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["New applications", "0"],
          ["Under review", "0"],
          ["Enrolled applicants", "0"],
          ["Active programs", "0"],
        ].map(([label, value]) => (
          <section key={label} className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
            <p className="text-xs uppercase tracking-wide text-[#86aa8d]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </section>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
          <h2 className="font-semibold text-white">Applications awaiting review</h2>
          <p className="mt-2 text-sm leading-7 text-[#86aa8d]">
            Submitted applicant profiles will appear here once program workflows are connected.
          </p>
        </section>
        <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
          <h2 className="font-semibold text-white">Program readiness</h2>
          <p className="mt-2 text-sm leading-7 text-[#86aa8d]">
            Program details, eligibility notes, and available departments will be managed in the
            Program Details section.
          </p>
        </section>
      </div>
    </div>
  );
}
