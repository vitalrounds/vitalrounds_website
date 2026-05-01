import Link from "next/link";
import ApplicantSignupForm from "./signup-form";

export const metadata = {
  title: "Sign up | VitalRounds",
  description: "Create a VitalRounds applicant account and verify your email.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#f5fbf6] px-6 py-10 text-[#2c3d2f]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-[#759d7b] hover:text-[#5f7362]">
          ← Back to VitalRounds
        </Link>
        <div className="mt-6">
          <ApplicantSignupForm />
        </div>
      </div>
    </main>
  );
}
