import Link from "next/link";
import { PartnersTabs } from "../partners-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner onboarding | VitalRounds Control",
};

export default function PartnerOnboardingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Partners</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Track onboarding steps for hospitals and clinics joining VitalRounds.
          </p>
          <PartnersTabs active="onboarding" />
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
          On Boarding
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Partner onboarding pipeline</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Pending partner registration, documentation, and approval steps will live here.
        </p>
      </section>
    </div>
  );
}
