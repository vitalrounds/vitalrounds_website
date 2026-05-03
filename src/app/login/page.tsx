import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  const controlOrigin = process.env.NEXT_PUBLIC_CONTROL_ORIGIN;

  return (
    <main className="min-h-screen bg-[#f5fbf6] px-4 py-8 text-[#2c3d2f] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-[#759d7b] hover:text-[#5f7362]"
        >
          ← Back to VitalRounds
        </Link>
        <Suspense fallback={<p className="text-sm text-[#6e706e]">Loading…</p>}>
          <LoginForm controlOrigin={controlOrigin} />
        </Suspense>
      </div>
    </main>
  );
}
