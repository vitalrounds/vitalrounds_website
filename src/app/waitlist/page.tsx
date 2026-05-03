import type { Metadata } from "next";
import WaitlistForm from "./waitlist-form";

export const metadata: Metadata = {
  title: "Join the Clinical Observership Wait List",
  description:
    "Join the VitalRounds wait list for structured clinical observership programs, clinical exposure, and local clinical experience pathways in Australia.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    url: "/waitlist",
    title: "Join the Clinical Observership Wait List",
    description:
      "Submit your interest in VitalRounds clinical observership pathways and Australian clinical exposure opportunities.",
  },
};

export default function WaitlistPage() {
  return <WaitlistForm />;
}
