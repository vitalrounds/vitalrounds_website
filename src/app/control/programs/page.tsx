import Link from "next/link";
import { ProgramTabs } from "./program-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Programs | VitalRounds Control",
};

export default function ProgramsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Our Programs</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
            Browse and manage VitalRounds observership program offerings.
          </p>
          <ProgramTabs active="browse" />
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
          Browse Programs
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Available program catalogue</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#a6ccac]">
          Published and draft programs will appear here once program records are enabled.
        </p>
      </section>
    </div>
  );
}
