export default function DoctorPaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Payments</h1>
      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <h2 className="font-semibold text-white">Program payments and invoices</h2>
        <p className="mt-2 text-sm text-[#86aa8d]">
          Programs the applicant has paid for, program cost, and PDF invoices for viewing or
          downloading will appear here once payment records are enabled.
        </p>
      </section>
    </div>
  );
}
