export default function BrowseProgramsPage() {
  const cards = ["Cardiology", "Emergency", "Surgery", "Paediatrics", "Orthopaedics", "Neurology"];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Browse Programs</h1>
      <div className="flex flex-wrap gap-2">
        {["All Specialties", "Cardiology", "Emergency", "Surgery"].map((item) => (
          <button key={item} className="rounded-full bg-[#28452f] px-4 py-2 text-sm font-semibold">
            {item}
          </button>
        ))}
        <input placeholder="Search programs..." className="rounded-full border border-[#28452f] bg-[#1a2b1e] px-4 py-2 text-sm outline-none" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card} className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-5">
            <p className="text-xs font-semibold text-[#6bbf73]">{card}</p>
            <h2 className="mt-2 font-semibold text-white">{card} Observership</h2>
            <p className="mt-1 text-sm text-[#86aa8d]">Program details and availability will appear here.</p>
            <button className="mt-4 w-full rounded-full bg-[#4d8b57] px-4 py-2 text-sm font-semibold text-white">
              Apply Now
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
