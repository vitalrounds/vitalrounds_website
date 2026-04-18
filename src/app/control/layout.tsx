import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ControlSidebar } from "./control-sidebar";

export default async function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin("/control");

  return (
    <div className="flex min-h-screen flex-col bg-[#1a241c] text-[#cbecd0]">
      <header className="border-b border-[#354a38] bg-[#2c3d2f]">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/control" className="text-sm font-semibold tracking-wide">
            VitalRounds Control
          </Link>
          <Link href="/auth/sign-out" className="text-sm text-[#a6ccac] hover:text-white">
            Sign out
          </Link>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <ControlSidebar />
        <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
