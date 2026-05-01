import { DoctorThemeSettings } from "../dashboard-shell";

export default function DoctorSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Personalize your doctor portal workspace.
        </p>
      </div>
      <section className="rounded-2xl border border-[#223a29] bg-[#1a2b1e] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#86aa8d]">Appearance</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Portal theme</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#86aa8d]">
          Choose dark or light mode for this device.
        </p>
        <div className="mt-5">
          <DoctorThemeSettings />
        </div>
      </section>
    </div>
  );
}
