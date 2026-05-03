import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact VitalRounds for Clinical Observership Programs",
  description:
    "Contact VitalRounds for clinical observership program enquiries, hospital partnerships, and applicant support in Australia, Victoria, and Melbourne.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact VitalRounds for Clinical Observership Programs",
    description:
      "Contact VitalRounds about clinical observership pathways, clinical exposure, local clinical experience, and partnership enquiries.",
  },
};

export default function ContactPage() {
  return (
    <main
      className="min-h-screen overflow-x-clip text-[#2c3d2f]"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, #f8fcf8 0%, #ecf4ed 43%, #e2ede4 72%, #d7e6d9 100%)",
      }}
    >
      <section className="mx-auto max-w-5xl px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="VitalRounds"
              width={190}
              height={42}
              className="h-auto w-[145px] sm:w-[190px]"
            />
          </div>
          <Link
            href="/"
            className="rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
          >
            ← Back home
          </Link>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#bfd5c3] bg-gradient-to-r from-[#d5e7d9] via-[#dff0e3] to-[#d3e4d6] p-7 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#354a38]">
            Contact us
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            Let&apos;s discuss your observership pathway or partnership plans.
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-[#4f6553]">
            Keep it simple: send one email about clinical observership programs, clinical exposure,
            or local clinical experience pathways, and we&apos;ll guide you to the right next step.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold">General enquiries</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f7362]">
              Questions about the platform, process, or next steps.
            </p>
            <a
              href="mailto:admin@vitalrounds.com.au?subject=General%20Enquiry"
              className="mt-4 inline-flex rounded-full bg-[#759d7b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f7362]"
            >
              Email admin@vitalrounds.com.au
            </a>
          </article>

          <article className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold">Hospital partnership</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f7362]">
              Discuss onboarding and observership pathway collaboration.
            </p>
            <a
              href="mailto:admin@vitalrounds.com.au?subject=Hospital%20Partnership%20Enquiry"
              className="mt-4 inline-flex rounded-full border border-[#759d7b] px-4 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
            >
              Contact partnership team
            </a>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.7rem] border border-[#c8ddcb]/80 bg-[#f7fbf8]/65 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold">Applicant support</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f7362]">
              Need help with your wait list submission or documents? Include your full name and
              preferred contact email.
            </p>
            <a
              href="mailto:admin@vitalrounds.com.au?subject=Applicant%20Support"
              className="mt-4 inline-flex rounded-full border border-[#759d7b] px-4 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
            >
              Get applicant support
            </a>
          </article>
          <article className="rounded-[1.7rem] border border-[#bfd5c3] bg-[#e7f2e9] p-6">
            <h2 className="text-lg font-semibold">Response expectation</h2>
            <p className="mt-2 text-sm leading-7 text-[#4f6553]">
              Most enquiries are answered within 1-2 business days. For faster support, include the
              purpose of your enquiry in the email subject line.
            </p>
            <div className="mt-4 text-sm font-semibold text-[#354a38]">admin@vitalrounds.com.au</div>
          </article>
        </div>
      </section>
    </main>
  );
}
