import Link from "next/link";
import SettingsPanel from "./settings-panel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings | VitalRounds Control",
};

export default function ControlSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Personalize the Control workspace while keeping the VitalRounds olive brand language.
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
          Appearance
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Control theme</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Choose between the deep dark interface and a lighter clinical workspace. Your preference
          is saved on this device.
        </p>
        <div className="mt-5">
          <SettingsPanel />
        </div>
      </section>
    </div>
  );
}
