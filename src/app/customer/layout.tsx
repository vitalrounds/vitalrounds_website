import Link from "next/link";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5fbf6] text-[#2c3d2f]">
      <header className="border-b border-[#cbecd0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/customer/dashboard" className="text-sm font-semibold text-[#354a38]">
            VitalRounds — My programs
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-[#6e706e] hover:text-[#354a38]">
              Home
            </Link>
            <Link href="/auth/sign-out" className="text-[#759d7b] hover:text-[#5f7362]">
              Sign out
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
