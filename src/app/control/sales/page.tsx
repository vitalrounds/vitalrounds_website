import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales | VitalRounds Control",
};

export default function SalesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Sales</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Keep campaign assets organized and ready to share with secure links from one place.
          </p>
        </div>
        <Link
          href="/control"
          className="rounded-full border border-[#5f7362] px-4 py-2 text-sm text-[#cbecd0] hover:bg-[#354a38]"
        >
          ← Control home
        </Link>
      </div>

      <section className="rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">Campaign assets</p>
        <h2 className="mt-2 text-xl font-semibold text-white">PDF brochure library</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Upload and manage brochure PDFs for outreach. Open files quickly, remove old versions, and
          generate expiring secure links you can paste into sales emails.
        </p>
        <div className="mt-5">
          <Link
            href="/control/sales/brochures"
            className="inline-flex rounded-full bg-[#759d7b] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5f7362]"
          >
            Open brochure manager
          </Link>
        </div>
      </section>
    </div>
  );
}
