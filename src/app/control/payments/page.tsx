import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments | VitalRounds Control",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Payments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Track payment status, pending invoices, and future financial workflows.
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a9b80]">
          Payment workspace
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Payment pending</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Payment records and invoice tracking will appear here once payment workflows are connected.
        </p>
      </section>
    </div>
  );
}
