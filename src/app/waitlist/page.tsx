import type { Metadata } from "next";
import WaitlistForm from "./waitlist-form";

export const metadata: Metadata = {
  title: "Join the wait list | VitalRounds",
  description:
    "Tell us about your pathway and preferences to join the VitalRounds wait list.",
};

export default function WaitlistPage() {
  return <WaitlistForm />;
}
