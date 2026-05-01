const programs = [
  { title: "Cardiology Observership", site: "Royal Melbourne" },
  { title: "Emergency Medicine", site: "St Vincent's" },
  { title: "General Surgery", site: "Monash" },
];

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-semibold text-white">Welcome to VitalRounds !</h1>
        <p className="mt-2 text-sm text-[#86aa8d]">Your portal overview and available pathways.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Enrolled", "0"],
          ["Payment due", "0"],
          ["Programs open", "0"],
          ["Applications", "0"],
        ].map(([label, value]) => (
          <section key={label} className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
            <p className="text-xs uppercase tracking-wide text-[#86aa8d]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </section>
        ))}
      </div>
      <section>
        <h2 className="text-xl font-semibold text-white">Active enrollments</h2>
        <div className="mt-3 rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5 text-sm text-[#86aa8d]">
          No active enrollments yet.
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-white">Available programs</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {programs.map((program) => (
            <article key={program.title} className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
              <p className="text-xs font-semibold text-[#6bbf73]">Coming soon</p>
              <h3 className="mt-2 font-semibold text-white">{program.title}</h3>
              <p className="text-sm text-[#86aa8d]">{program.site}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full border border-[#4d8b57] px-3 py-1 text-xs font-semibold text-[#9bd4a4]">
                  Not open yet
                </span>
                <button disabled className="cursor-not-allowed rounded-full bg-[#4d8b57]/50 px-4 py-1.5 text-xs font-semibold text-white/70">
                  Apply Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
