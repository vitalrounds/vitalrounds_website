export default function DoctorBillingPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Billing</h1>
        <p className="mt-2 text-sm text-[#86aa8d]">
          Billing details will be used for saved card information and billing address.
        </p>
      </header>

      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">Coming soon</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Card details and billing address</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          This area is not ready yet. Users cannot add or edit credit card details or billing
          address information at this stage.
        </p>
      </section>
    </div>
  );
}
