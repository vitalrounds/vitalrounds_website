export default function PartnerProgramDetailsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Program Details</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Partner-facing information for observership availability, departments, and requirements.
        </p>
      </header>
      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">Coming soon</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Program configuration</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Program name, specialties, capacity, location, schedule, eligibility notes, and document
          requirements will be managed here after admin approval.
        </p>
      </section>
    </div>
  );
}
