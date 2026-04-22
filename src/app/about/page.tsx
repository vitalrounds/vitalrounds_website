import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About VitalRounds",
  description:
    "Learn about VitalRounds, our mission, our technology approach, and how we support observership pathways for doctors in Australia.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f5fbf6] text-[#2c3d2f]">
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="VitalRounds" width={220} height={48} />
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
          >
            Contact us
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-6">
            <p className="inline-flex rounded-full bg-[#cbecd0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38]">
              About VitalRounds
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Helping doctors bridge to Australian clinical confidence.
            </h1>
            <p className="text-base leading-8 text-[#5f7362]">
              VitalRounds is building a practical, guided pathway for doctors and international
              medical graduates seeking meaningful observership exposure in Australian healthcare
              settings.
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-[#d5e9d9] bg-white shadow-sm">
              <Image
                src="/about-us-collage.png"
                alt="VitalRounds story collage"
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 md:px-10">
        <article className="rounded-3xl border border-[#d5e9d9] bg-white p-6">
          <h2 className="text-2xl font-semibold">What&apos;s VitalRounds</h2>
          <p className="mt-3 leading-8 text-[#5f7362]">
            VitalRounds is a coordination platform for observership pathways. We help structure
            applications, documentation, and communication so doctors can move from uncertainty to
            clear next steps.
          </p>
        </article>

        <article className="grid gap-5 rounded-3xl border border-[#d5e9d9] bg-white p-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">Our Goal</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              Our goal is to make clinical exposure more transparent and more attainable for doctors
              preparing for Australian practice. We focus on consistency, practical readiness, and
              equitable access to opportunities.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#eaf7ec] p-4 md:col-span-4">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#cbecd0]" />
            <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-[#a6ccac]/60" />
            <p className="relative text-xs font-semibold uppercase tracking-wide text-[#354a38]">
              Growth &amp; Mentorship
            </p>
            <p className="relative mt-2 text-sm leading-7 text-[#354a38]">
              Helping doctors build practical confidence through guided exposure and feedback loops.
            </p>
          </div>
        </article>

        <article className="grid gap-5 rounded-3xl border border-[#d5e9d9] bg-white p-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">The Tech</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              We use a workflow-first platform that captures core applicant data, organizes
              documents, and supports review clarity for both candidates and administrators. The aim
              is fewer bottlenecks and better matching decisions.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#edf4ff] p-4 md:col-span-4">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#d6e4ff]" />
            <div className="absolute -bottom-8 left-2 h-20 w-20 rounded-full bg-[#bfd4ff]/70" />
            <p className="relative text-xs font-semibold uppercase tracking-wide text-[#2f4b7c]">
              Data &amp; Insights
            </p>
            <p className="relative mt-2 text-sm leading-7 text-[#2f4b7c]">
              Structured intake and review data to improve placement readiness over time.
            </p>
          </div>
        </article>

        <article className="grid gap-5 rounded-3xl border border-[#d5e9d9] bg-white p-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">Why VitalRounds?</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              Doctors need practical context, not just theory. VitalRounds exists to connect
              motivated clinicians with meaningful observership structures that build confidence,
              communication fluency, and system familiarity.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#fff4ea] p-4 md:col-span-4">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#ffe0bf]" />
            <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-[#ffd1a0]/70" />
            <p className="relative text-xs font-semibold uppercase tracking-wide text-[#7b4d1f]">
              Patient Care Paths
            </p>
            <p className="relative mt-2 text-sm leading-7 text-[#7b4d1f]">
              Better prepared doctors support safer care pathways and stronger team integration.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-[#d5e9d9] bg-white p-6">
          <h2 className="text-2xl font-semibold">Our Vision</h2>
          <p className="mt-3 leading-8 text-[#5f7362]">
            Our vision is to become Australia&apos;s most trusted observership coordination partner
            for emerging and internationally trained doctors. We want every motivated candidate to
            have a credible, clear, and human pathway to local clinical readiness.
          </p>
        </article>
      </section>
    </main>
  );
}
