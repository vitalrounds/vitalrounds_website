import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact VitalRounds",
  description:
    "Contact VitalRounds for observership program enquiries, hospital partnerships, and applicant support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f5fbf6] text-[#2c3d2f]">
      <section className="mx-auto max-w-4xl px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-semibold">Contact us</h1>
          <Link
            href="/"
            className="rounded-full border border-[#759d7b] px-5 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
          >
            ← Back home
          </Link>
        </div>

        <p className="mt-4 max-w-2xl leading-8 text-[#5f7362]">
          We&apos;d love to hear from you. Whether you are an applicant exploring observership
          opportunities or a hospital interested in partnership, the VitalRounds team can help.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-[#d5e9d9] bg-white p-6">
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

          <article className="rounded-3xl border border-[#d5e9d9] bg-white p-6">
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

        <article className="mt-6 rounded-3xl border border-[#d5e9d9] bg-white p-6">
          <h2 className="text-lg font-semibold">Applicant support</h2>
          <p className="mt-2 text-sm leading-7 text-[#5f7362]">
            Need help with your wait list submission or documents? Email us and include your full
            name and preferred contact email.
          </p>
          <a
            href="mailto:admin@vitalrounds.com.au?subject=Applicant%20Support"
            className="mt-4 inline-flex rounded-full border border-[#759d7b] px-4 py-2 text-sm font-semibold text-[#354a38] hover:bg-[#cbecd0]"
          >
            Get applicant support
          </a>
        </article>
      </section>
    </main>
  );
}
