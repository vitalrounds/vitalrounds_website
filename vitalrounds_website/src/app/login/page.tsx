import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  const controlOrigin = process.env.NEXT_PUBLIC_CONTROL_ORIGIN;

  return (
    <main className="min-h-screen bg-[#f5fbf6] px-6 py-16 text-[#2c3d2f]">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-[#759d7b] hover:text-[#5f7362]"
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
