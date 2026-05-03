import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your secure VitalRounds workspace.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  const controlOrigin = process.env.NEXT_PUBLIC_CONTROL_ORIGIN;

  return (
    <main
      className="relative h-dvh overflow-hidden bg-[#f5fbf6] bg-cover bg-center px-4 text-[#2c3d2f] sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(245, 251, 246, 0.76), rgba(245, 251, 246, 0.84)), url('/login-wallpaper.png')",
      }}
    >
      <Link
        href="/"
        className="absolute left-5 top-4 z-10 text-sm font-semibold text-[#759d7b] hover:text-[#5f7362] sm:left-8 sm:top-6"
      >
        ← Back to VitalRounds
      </Link>
      <div className="mx-auto flex h-full max-w-lg items-center justify-center pt-8">
        <Suspense fallback={<p className="text-sm text-[#6e706e]">Loading…</p>}>
          <LoginForm controlOrigin={controlOrigin} />
        </Suspense>
      </div>
    </main>
  );
}
