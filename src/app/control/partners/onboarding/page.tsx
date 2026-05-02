import Link from "next/link";
import { PartnersTabs } from "../partners-tabs";
import { PartnerOnboardingForm } from "./partner-onboarding-form";

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

      <PartnerOnboardingForm />
    </div>
  );
}
