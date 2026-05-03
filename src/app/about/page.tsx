import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About VitalRounds Clinical Observership Pathways",
  description:
    "Learn how VitalRounds supports clinical observership programs, clinical exposure, and local clinical experience pathways for doctors in Australia, Victoria, and Melbourne.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About VitalRounds Clinical Observership Pathways",
    description:
      "VitalRounds supports doctors and IMGs seeking structured Australian clinical observership pathways and local clinical experience readiness.",
  },
};

export default function AboutPage() {
  return (
    <main
      className="min-h-screen overflow-x-clip text-[#2c3d2f]"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, #f8fcf8 0%, #ecf4ed 43%, #e2ede4 72%, #d7e6d9 100%)",
      }}
    >
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="VitalRounds"
              width={220}
              height={48}
              className="h-auto w-[150px] sm:w-[220px]"
            />
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
          >
            Contact us
          </Link>
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <p className="inline-flex rounded-full border border-[#9bbba0] bg-[#f4faf5]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38] backdrop-blur-sm">
              About VitalRounds
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Helping doctors bridge to Australian clinical confidence.
            </h1>
            <p className="max-w-[30rem] text-base leading-8 text-[#5f7362]">
              VitalRounds is a practical pathway platform for doctors and international medical
              graduates seeking meaningful clinical exposure in Australian healthcare settings,
              including Victoria and Melbourne pathways when suitable opportunities are available.
            </p>
          </div>
          <div className="relative lg:col-span-7">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[#c7dfcb]/80 blur-xl" />
            <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full bg-[#b8d2bc]/70 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#c3d9c7]/80 bg-[#eef6ef]/80 p-2 backdrop-blur-sm">
              <Image
                src="/about-us-collage.png"
                alt="VitalRounds story collage"
                className="h-auto w-full rounded-[1.4rem]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:px-10">
        <article className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold">What&apos;s VitalRounds</h2>
          <p className="mt-3 leading-8 text-[#5f7362]">
            VitalRounds is a coordination platform for observership pathways. We help structure
            applications, documentation, and communication so doctors can move from uncertainty to
            clear next steps toward clinical observership programs in Australia.
          </p>
        </article>

        <article className="grid gap-5 rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">Our Goal</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              Our goal is to make clinical exposure more transparent and attainable for doctors
              preparing for Australian practice. We know that IMG doctors, fresh medical graduates,
              and medical staff returning after personal gaps can get stuck in a no-clinical-
              exposure cycle, so we are building a clear, practical pathway that helps them move
              forward with confidence toward Australian clinical readiness, local clinical
              experience, and AHPRA-aware preparation.
            </p>
          </div>
          <BrandPanel
            title="Growth & Mentorship"
            description="Guided exposure, feedback loops, and practical confidence for career progression."
            icon="mentorship"
          />
        </article>

        <article className="grid gap-5 rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">The Tech</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              We use a workflow-first platform that captures core applicant data, organizes
              documents, and supports review clarity for both candidates and administrators. The aim
              is fewer bottlenecks and better matching decisions.
            </p>
          </div>
          <BrandPanel
            title="Data & Insights"
            description="Structured intake, organized documents, and clearer readiness signals over time."
            icon="insights"
          />
        </article>

        <article className="grid gap-5 rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold">Why VitalRounds?</h2>
            <p className="mt-3 leading-8 text-[#5f7362]">
              Doctors need practical context, not just theory. VitalRounds exists to connect
              motivated clinicians with meaningful observership structures that build confidence,
              communication fluency, and system familiarity.
            </p>
          </div>
          <BrandPanel
            title="Patient Care Paths"
            description="Better prepared doctors, safer care pathways, and stronger team integration."
            icon="care"
          />
        </article>

        <article className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold">AMC, AHPRA, and Local Clinical Experience</h2>
          <p className="mt-3 leading-8 text-[#5f7362]">
            Many doctors prepare for AMC1 training, AMC2 training, AMC exams, and AHPRA registration
            while also trying to close a local clinical experience gap. VitalRounds does not promise
            exam results or replace formal AMC preparation. Our role is to help organize clinical
            exposure pathways and Australian healthcare familiarity that can sit alongside those
            professional goals.
          </p>
        </article>

        <article className="rounded-[1.7rem] border border-[#bfd5c3] bg-gradient-to-r from-[#d5e7d9] via-[#dff0e3] to-[#d3e4d6] p-6">
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

function BrandPanel({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "mentorship" | "insights" | "care";
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.4rem] border border-[#c7ddcb] bg-gradient-to-br from-[#eef7ef] via-[#e4f0e6] to-[#d8e8dc] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] md:col-span-4">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <svg viewBox="0 0 260 190" className="h-full w-full" aria-hidden="true">
          <path
            d="M-20 122c34-32 69-32 103 0s70 32 108 0 67-31 93-3"
            fill="none"
            stroke="#9fbda5"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M-11 62c29-26 60-25 92 1s64 25 96 0 58-27 86-5"
            fill="none"
            stroke="#6f8f75"
            strokeDasharray="6 9"
            strokeLinecap="round"
            strokeWidth="2"
            opacity="0.45"
          />
          <circle cx="206" cy="43" r="56" fill="#c5e5ca" opacity="0.45" />
          <circle cx="40" cy="162" r="45" fill="#b2d3b8" opacity="0.4" />
        </svg>
      </div>
      <div className="relative flex min-h-48 flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38]">{title}</p>
          <p className="mt-3 text-sm leading-7 text-[#405844]">{description}</p>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <PanelIcon icon={icon} />
          <span className="h-2 w-20 rounded-full bg-[#759d7b]/40" />
        </div>
      </div>
    </div>
  );
}

function PanelIcon({ icon }: { icon: "mentorship" | "insights" | "care" }) {
  if (icon === "mentorship") {
    return (
      <svg viewBox="0 0 92 72" className="h-16 w-20 text-[#5f7362]" fill="none" aria-hidden="true">
        <path d="M14 51h24l9-9h31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 23h22v22H18zM52 17h22v22H52z" stroke="currentColor" strokeWidth="2" />
        <path d="m40 32 12-4M63 39v13M57 46h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "insights") {
    return (
      <svg viewBox="0 0 92 72" className="h-16 w-20 text-[#5f7362]" fill="none" aria-hidden="true">
        <path d="M18 52V28M36 52V18M54 52V34M72 52V24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M13 53h66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 23c12 9 23 9 33 0s18-10 26-2" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 92 72" className="h-16 w-20 text-[#5f7362]" fill="none" aria-hidden="true">
      <path d="M18 28h56v28H18z" stroke="currentColor" strokeWidth="2" />
      <path d="M30 28V18h32v10M46 34v16M38 42h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 50c12 13 24 13 36 0s24-13 36 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}
