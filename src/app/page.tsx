import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RevealOnScroll from "@/components/reveal-on-scroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitalrounds.com.au";

export const metadata: Metadata = {
  title: "Clinical Observership Programs in Australia for IMGs",
  description:
    "Join VitalRounds to access structured clinical observership pathways in Australia for international medical graduates and doctors preparing for local healthcare environments.",
  alternates: {
    canonical: "/",
  },
};

const valueHighlights = [
  {
    title: "Structured Observership Pathways",
    description: "Clear progression, not random application loops.",
  },
  {
    title: "Australian Practice Context",
    description: "Workflows, communication, and local expectations.",
  },
  {
    title: "Coordinated Review",
    description: "Applicant information is organized before matching.",
  },
  {
    title: "Human + Data Guidance",
    description: "Better decisions through structured insight and support.",
  },
];

const journeySteps = [
  {
    icon: "1",
    title: "Join wait list",
    detail: "Submit profile and core documents.",
  },
  {
    icon: "2",
    title: "Readiness review",
    detail: "VitalRounds checks clarity and fit.",
  },
  {
    icon: "3",
    title: "Pathway match",
    detail: "Potential placements are identified.",
  },
  {
    icon: "4",
    title: "Next step",
    detail: "You receive practical direction and updates.",
  },
];

const faqItems = [
  {
    q: "What is the VitalRounds wait list?",
    a: "The wait list is for doctors and international medical graduates interested in VitalRounds clinical observership opportunities in Australian healthcare settings.",
  },
  {
    q: "Who can apply for observership pathways?",
    a: "Doctors, including international medical graduates and early-career clinicians, can apply by submitting their details, preferences, and required documents.",
  },
  {
    q: "How are applicants matched?",
    a: "VitalRounds reviews submissions for completeness and fit, then coordinates potential placement pathways aligned to hospital requirements and applicant goals.",
  },
];

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VitalRounds",
    url: siteUrl,
    logo: `${siteUrl}/logo-original.png`,
    email: "admin@vitalrounds.com.au",
    sameAs: [siteUrl],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Clinical observership program coordination",
    provider: {
      "@type": "Organization",
      name: "VitalRounds",
      url: siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: "Australia",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Doctors and international medical graduates",
    },
    description:
      "Structured observership pathways and application review workflows for doctors seeking Australian clinical exposure.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main
      className="min-h-screen overflow-x-clip text-[#2c3d2f]"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, #f8fcf8 0%, #ecf4ed 43%, #e2ede4 72%, #d7e6d9 100%)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-3 px-4 py-5 sm:px-6 sm:py-7 md:px-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="VitalRounds logo"
            width={240}
            height={54}
            priority
            className="h-auto w-[122px] sm:w-[210px] md:w-[240px]"
          />
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/about"
            className="hidden rounded-full border border-[#759d7b] px-4 py-2 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0] md:inline-flex"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-full border border-[#759d7b] px-4 py-2 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0] md:inline-flex"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full border border-[#759d7b] px-3 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0] sm:h-10 sm:px-5"
          >
            Login
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-[#759d7b] px-3 text-sm font-semibold text-white transition hover:bg-[#5f7362] sm:h-10 sm:px-5"
          >
            <span className="sm:hidden">Wait list</span>
            <span className="hidden sm:inline">Join the wait list</span>
          </Link>
        </div>
      </section>

      <section className="relative px-6 pb-16 pt-6 md:px-10 md:pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[28rem] max-w-6xl rounded-[2.5rem] bg-gradient-to-br from-[#e9f6eb] via-[#dceadf] to-[#cfdfd3]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-10">
          <RevealOnScroll className="space-y-5 lg:col-span-5">
            <p className="inline-flex rounded-full border border-[#9bbba0] bg-[#f4faf5]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38] backdrop-blur-sm">
              Purpose-built for IMG clinical exposure
            </p>
            <h1 className="max-w-[18ch] text-balance text-4xl font-semibold leading-[1.08] text-[#2c3d2f] md:text-5xl xl:text-[3.25rem]">
              Build clinical confidence in Australia through guided observerships.
            </h1>
            <p className="max-w-[30rem] text-base leading-8 text-[#5f7362]">
              A cleaner, more structured route for doctors closing local experience gaps and
              preparing for Australian healthcare environments.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/waitlist"
                className="rounded-full bg-[#759d7b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362]"
              >
                Join the wait list
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[#759d7b] bg-[#f4faf5]/80 px-6 py-3 text-sm font-semibold text-[#354a38] transition hover:bg-[#dceede]"
              >
                Explore VitalRounds
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-[#4d6450]">
              <span className="rounded-full bg-[#deecdf] px-3 py-1">IMG focused</span>
              <span className="rounded-full bg-[#deecdf] px-3 py-1">Guided pathway</span>
              <span className="rounded-full bg-[#deecdf] px-3 py-1">Hospital-ready profile</span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={150} className="relative lg:col-span-7 lg:pl-2">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[#c7dfcb]/80 blur-xl" />
            <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full bg-[#b8d2bc]/70 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#c3d9c7]/80 bg-[#eef6ef]/80 p-2 backdrop-blur-sm">
              <Image
                src="/clinical-network-poster.png"
                alt="VitalRounds: A New Era in Medical Rounds"
                width={1200}
                height={616}
                className="block h-auto w-full rounded-[1.4rem]"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold md:text-4xl">Why it feels different</h2>
            <p className="mt-3 text-base leading-7 text-[#5f7362]">
              Built to reduce friction, uncertainty, and repetition for applicants and partners.
            </p>
          </RevealOnScroll>
          <div className="grid gap-4 md:grid-cols-2">
            {valueHighlights.map((item, index) => (
              <RevealOnScroll key={item.title} delayMs={index * 90}>
                <article className="rounded-3xl border border-[#c8ddcb]/80 bg-[#f6fbf7]/70 p-5 backdrop-blur-sm">
                  <h3 className="text-base font-semibold text-[#354a38]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5f7362]">{item.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold md:text-4xl">A clear pathway</h2>
            <p className="mt-3 text-base leading-7 text-[#5f7362]">
              Four focused steps from wait list to real next action.
            </p>
          </RevealOnScroll>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, index) => (
              <RevealOnScroll key={step.title} delayMs={index * 90}>
                <article className="rounded-2xl border border-[#bfd5c3] bg-[#ebf4ed]/70 p-4">
                  <div className="mb-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#759d7b] px-2 text-xs font-semibold text-white">
                    {step.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-[#354a38]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#5f7362]">{step.detail}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 pt-8 md:pb-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll className="relative overflow-hidden rounded-[2rem] border border-[#bfd5c3] bg-gradient-to-r from-[#d5e7d9] via-[#dff0e3] to-[#d3e4d6] px-7 py-9 md:px-10 md:py-11">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#b6d1ba]/60 blur-2xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38]">
              Next step
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-[#2c3d2f] md:text-3xl">
              Whether you are applying or exploring partnerships, VitalRounds keeps the pathway
              simple, clear, and professional.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-[#759d7b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362]"
              >
                Contact VitalRounds
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[#759d7b] bg-[#f4faf5]/80 px-6 py-3 text-sm font-semibold text-[#354a38] transition hover:bg-[#dceede]"
              >
                Read our story
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14 md:px-10 md:pb-16">
        <RevealOnScroll className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-[#2c3d2f]">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-2xl border border-[#d7e8da] bg-[#ffffffa8] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#354a38]">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-7 text-[#5f7362]">{item.a}</p>
              </details>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-t border-[#d5e9d9] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 md:px-10">
          <p className="text-sm text-[#6e706e]">© {new Date().getFullYear()} VitalRounds</p>
          <div className="flex gap-4 text-sm text-[#354a38]">
            <Link href="/about" className="hover:text-[#2c3d2f]">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#2c3d2f]">
              Contact
            </Link>
            <a href="mailto:admin@vitalrounds.com.au" className="hover:text-[#2c3d2f]">
              Email
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
