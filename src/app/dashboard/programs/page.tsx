export default function BrowseProgramsPage() {
  const cards = ["Cardiology", "Emergency", "Surgery", "Paediatrics", "Orthopaedics", "Neurology"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">Browse Programs</h1>
      <div className="flex flex-wrap gap-2">
        {["All Specialties", "Cardiology", "Emergency", "Surgery"].map((item) => (
          <button key={item} className="rounded-full bg-[#28452f] px-4 py-2 text-sm font-semibold">
            {item}
          </button>
        ))}
        <input
          placeholder="Search programs..."
          className="min-w-0 flex-1 rounded-full border border-[#28452f] bg-[#1a2b1e] px-4 py-2 text-sm outline-none max-sm:w-full"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card} className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
            <p className="text-xs font-semibold text-[#6bbf73]">{card}</p>
            <h2 className="mt-2 font-semibold text-white">{card} Observership</h2>
            <p className="mt-1 text-sm text-[#86aa8d]">Program details and availability are coming soon.</p>
            <span className="mt-4 inline-flex rounded-full border border-[#4d8b57] px-3 py-1 text-xs font-semibold text-[#9bd4a4]">
              Coming soon
            </span>
            <button disabled className="mt-4 w-full cursor-not-allowed rounded-full bg-[#4d8b57]/50 px-4 py-2 text-sm font-semibold text-white/70">
              Apply Now
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
