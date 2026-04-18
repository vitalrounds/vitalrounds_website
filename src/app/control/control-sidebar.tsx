"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/control", label: "Overview" },
  { href: "/control/waitlist", label: "Wait list" },
  { href: "/control/partners", label: "Partners" },
] as const;

export function ControlSidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 border-r border-[#354a38] bg-[#243329]">
      <nav className="sticky top-0 flex w-52 flex-col gap-1 px-3 py-6" aria-label="Control panel">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#7a9b80]">
          Navigate
        </p>
        {items.map(({ href, label }) => {
          const active =
            href === "/control"
              ? pathname === "/control"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={
                active
                  ? "rounded-lg bg-[#354a38] px-3 py-2 text-sm font-medium text-white"
                  : "rounded-lg px-3 py-2 text-sm font-medium text-[#cbecd0] hover:bg-[#2c3d2f] hover:text-white"
              }
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
