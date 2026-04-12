import Link from "next/link";

export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a241c] text-[#cbecd0]">
      <header className="border-b border-[#354a38] bg-[#2c3d2f]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/control" className="text-sm font-semibold tracking-wide">
            VitalRounds Control
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/auth/sign-out" className="text-[#a6ccac] hover:text-white">
              Sign out
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
