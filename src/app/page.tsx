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
    title: "Structured Clinical Observerships",
    description: "Practical hospital exposure, not recruitment placement.",
  },
  {
    title: "Australian System Readiness",
    description: "Learn local workflows, documentation, and communication.",
  },
  {
    title: "Coordinated Review Pathway",
    description: "VitalRounds quality-checks every application first.",
  },
  {
    title: "Role-Specific Portals",
    description: "Dedicated experiences for hospitals, applicants, and admins.",
  },
];

const roleCards = [
  {
    heading: "Hospital Workforce Admin",
    points: [
      "Manage schedules and participating departments",
      "Set requirements and approve candidates",
    ],
    buttonLabel: "Partner as a Hospital",
    buttonHref: "mailto:admin@vitalrounds.com.au?subject=Hospital%20Partnership%20Request",
  },
  {
    heading: "Applicants (IMGs & Fresh Graduates)",
    points: [
      "Create profile and upload qualifications",
      "Browse opportunities and submit applications",
    ],
    buttonLabel: "Start Applicant Journey",
    buttonHref: "mailto:admin@vitalrounds.com.au?subject=Applicant%20Registration%20Interest",
  },
  {
    heading: "VitalRounds Admin",
    points: [
      "Review applications before hospital routing",
      "Onboard hospitals and manage access",
    ],
    buttonLabel: "Request Admin Access",
    buttonHref: "mailto:admin@vitalrounds.com.au?subject=Admin%20Access%20Request",
  },
];

const journeySteps = [
  {
    icon: "1",
    title: "Apply",
    detail: "Doctors submit profile, documents, and preferences.",
  },
  {
    icon: "2",
    title: "Pre-Review",
    detail: "VitalRounds validates completeness and fit.",
  },
  {
    icon: "3",
    title: "Hospital Match",
    detail: "Eligible applications are routed to programs.",
  },
  {
    icon: "4",
    title: "Decision",
    detail: "Hospitals review and respond against criteria.",
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
          "linear-gradient(105deg, #f5fbf6 0%, #f5fbf6 34%, #ecf4ed 52%, #dfece2 72%, #d4e4d6 100%)",
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
      <section className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-7 md:px-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="VitalRounds logo"
            width={240}
            height={54}
            priority
            className="h-auto w-[150px] sm:w-[210px] md:w-[240px]"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border border-[#759d7b] px-4 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0] sm:px-5"
          >
            Login
          </Link>
          <a
            href="#roles"
            className="hidden rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0] md:inline-flex"
          >
            Platform Roles
          </a>
          <Link
            href="/waitlist"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#759d7b] px-4 text-sm font-semibold text-white transition hover:bg-[#5f7362] sm:px-5"
          >
            Join the wait list
          </Link>
        </div>
      </section>

      <section className="relative px-6 pb-24 pt-8 md:px-10">
        <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
          <RevealOnScroll className="min-w-0 space-y-5 overflow-x-clip lg:col-span-5">
            <p className="inline-flex rounded-full bg-[#cbecd0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#354a38]">
              Purpose-built for IMG clinical exposure
            </p>
            <h1 className="max-w-[18ch] text-balance text-4xl font-semibold leading-[1.08] text-[#2c3d2f] md:text-5xl xl:text-[3.35rem]">
              Build clinical confidence in Australia through guided observerships.
            </h1>
            <p className="rounded-2xl border border-[#a6ccac] bg-white px-4 py-3 text-sm font-semibold leading-7 text-[#354a38]">
              The light at the end of the tunnel for doctors closing local
              experience gaps.
            </p>
            <p className="text-base leading-8 text-[#6e706e] lg:max-w-[28rem]">
              VitalRounds helps doctors close local experience gaps through
              structured observership pathways in Australian healthcare settings.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="mailto:admin@vitalrounds.com.au?subject=Applicant%20Interest"
                className="rounded-full bg-[#759d7b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362]"
              >
                Start as Applicant
              </a>
              <a
                href="mailto:admin@vitalrounds.com.au?subject=Hospital%20Program%20Enquiry"
                className="rounded-full border border-[#759d7b] bg-white px-6 py-3 text-sm font-semibold text-[#354a38] transition hover:bg-[#cbecd0]"
              >
                Register a Hospital Program
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={150} className="relative z-10 min-w-0 lg:col-span-7">
            <div
              className="overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{ boxShadow: "0 24px 56px -20px rgba(44, 61, 47, 0.35)" }}
            >
              <Image
                src="/clinical-network-poster.png"
                alt="VitalRounds: A New Era in Medical Rounds"
                width={1200}
                height={616}
                className="block h-auto w-full align-middle"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-[#eaf7ec] py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-semibold text-[#2c3d2f] md:text-4xl">
              A full pathway from application to hospital review
            </h2>
            <p className="mt-4 text-base leading-8 text-[#6e706e]">
              A clear, guided pathway for applicants, VitalRounds, and hospitals.
            </p>
          </RevealOnScroll>
          <div className="grid gap-5 md:grid-cols-2">
            {valueHighlights.map((item, index) => (
              <RevealOnScroll key={item.title} delayMs={index * 120}>
                <li className="list-none rounded-3xl border border-[#a6ccac] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#354a38]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#6e706e]">
                    {item.description}
                  </p>
                </li>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <RevealOnScroll>
          <h2 className="text-3xl font-semibold text-[#2c3d2f] md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#6e706e]">
            A simple four-step roadmap from application to hospital decision.
          </p>
        </RevealOnScroll>

        <div className="relative mt-8 hidden md:block">
          <div className="absolute left-8 right-8 top-8 h-1 rounded-full bg-[#a6ccac]" />
          <div className="grid grid-cols-4 gap-4">
            {journeySteps.map((step, index) => (
              <RevealOnScroll key={step.title} delayMs={index * 120}>
                <article className="rounded-3xl border border-[#a6ccac] bg-white p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#759d7b] text-xs font-bold text-white">
                      {step.icon}
                    </span>
                    <h3 className="text-base font-semibold text-[#354a38]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-[#6e706e]">{step.detail}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:hidden">
          {journeySteps.map((step, index) => (
            <RevealOnScroll key={step.title} delayMs={index * 90}>
              <article className="rounded-3xl border border-[#a6ccac] bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#759d7b] text-xs font-bold text-white">
                    {step.icon}
                  </span>
                  <h3 className="text-base font-semibold text-[#354a38]">{step.title}</h3>
                </div>
                <p className="text-sm leading-7 text-[#6e706e]">{step.detail}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-[#354a38] py-16 text-white">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <RevealOnScroll>
            <h2 className="text-3xl font-semibold md:text-4xl">
            Three tailored account experiences
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#cbecd0]">
              Three interfaces. Three workflows. One coordinated platform.
            </p>
          </RevealOnScroll>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {roleCards.map((role, index) => (
              <RevealOnScroll key={role.heading} delayMs={index * 120}>
                <article className="flex h-full flex-col rounded-3xl border border-[#5f7362] bg-[#2c3d2f] p-6">
                  <h3 className="text-lg font-semibold">{role.heading}</h3>
                  <ul className="mt-4 flex-1 space-y-2 text-sm leading-7 text-[#cbecd0]">
                    {role.points.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                  <a
                    href={role.buttonHref}
                    className="mt-6 inline-flex rounded-full bg-[#a6ccac] px-4 py-2 text-sm font-semibold text-[#2c3d2f] transition hover:bg-[#cbecd0]"
                  >
                    {role.buttonLabel}
                  </a>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <RevealOnScroll className="rounded-[2rem] bg-[#cbecd0] px-8 py-10 md:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38]">
            Ready to launch your pathway?
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#2c3d2f] md:text-4xl">
            Whether you are a hospital or an applicant, VitalRounds helps you
            move with confidence and clarity.
          </h2>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="mailto:admin@vitalrounds.com.au?subject=General%20Website%20Enquiry"
              className="rounded-full bg-[#759d7b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7362]"
            >
              Contact VitalRounds
            </a>
          </div>
          <div className="mt-6 text-xs text-[#354a38]">
            Private applicant and partner onboarding is managed directly by VitalRounds.
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-t border-[#d5e9d9] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 md:px-10">
          <p className="text-sm text-[#6e706e]">© {new Date().getFullYear()} VitalRounds</p>
          <div className="flex gap-4 text-sm text-[#354a38]">
            <a href="mailto:admin@vitalrounds.com.au" className="hover:text-[#2c3d2f]">
              Email
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        <RevealOnScroll className="rounded-3xl border border-[#cfe3d3] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#2c3d2f]">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-2xl border border-[#d5e9d9] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-[#354a38]">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-7 text-[#6e706e]">{item.a}</p>
              </details>
            ))}
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}
