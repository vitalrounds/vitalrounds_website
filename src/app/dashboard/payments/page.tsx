export default function DoctorPaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Payments</h1>
      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <h2 className="font-semibold text-white">Invoices</h2>
        <p className="mt-2 text-sm text-[#86aa8d]">
          Invoice list, Stripe Pay Now button, and PDF receipt downloads will appear here once
          Stripe is configured.
        </p>
      </section>
    </div>
  );
}
