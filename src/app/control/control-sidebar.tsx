"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/control", label: "Dashboard", icon: OverviewIcon },
  { href: "/control/applicants", label: "Applicants", icon: WaitlistIcon },
  { href: "/control/programs", label: "Our Programs", icon: ProgramsIcon },
  { href: "/control/sales", label: "Sales", icon: SalesIcon },
  { href: "/control/partners", label: "Partners", icon: PartnersIcon },
  { href: "/control/payments", label: "Payments", icon: PaymentsIcon },
] as const;

const bottomItems = [
  { href: "/control/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function ControlSidebar({
  collapsed,
  mobileOpen = false,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const effectiveCollapsed = mobileOpen ? false : collapsed;

  return (
    <aside
      className={
        mobileOpen
          ? "fixed inset-y-0 left-0 z-40 w-64 translate-x-0 overflow-hidden border-r border-[var(--control-border)] bg-[var(--control-surface-strong)] shadow-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-none"
          : collapsed
            ? "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full overflow-hidden border-r border-[var(--control-border)] bg-[var(--control-surface-strong)] shadow-2xl transition-transform duration-300 ease-in-out md:static md:block md:w-16 md:translate-x-0 md:shrink-0 md:shadow-none md:transition-[width]"
            : "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full overflow-hidden border-r border-[var(--control-border)] bg-[var(--control-surface-strong)] shadow-2xl transition-transform duration-300 ease-in-out md:static md:block md:w-56 md:translate-x-0 md:shrink-0 md:shadow-none md:transition-[width]"
      }
    >
      <nav
        className={
          effectiveCollapsed
            ? "sticky top-0 flex h-full min-h-0 w-16 flex-col gap-1 px-2 py-4 transition-[padding] duration-300 ease-in-out"
            : "sticky top-0 flex h-full min-h-0 w-64 flex-col gap-1 px-3 py-4 transition-[padding] duration-300 ease-in-out md:w-56"
        }
        aria-label="Control panel"
      >
        {!effectiveCollapsed && (
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--control-muted)]">
            Navigate
          </p>
        )}
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={effectiveCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1 border-t border-[var(--control-border)] pt-3">
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={effectiveCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: (typeof items)[number] | (typeof bottomItems)[number];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { href, label, icon: Icon } = item;
  const active =
    href === "/control"
      ? pathname === "/control"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={false}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={
        active
          ? "flex items-center gap-3 rounded-xl bg-[var(--control-active)] px-3 py-2.5 text-sm font-medium text-[var(--control-text)]"
          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--control-soft)] hover:bg-[var(--control-hover)] hover:text-[var(--control-text)]"
      }
      aria-current={active ? "page" : undefined}
    >
      <Icon />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M3.5 8.5 10 3l6.5 5.5V16a1 1 0 0 1-1 1h-3.25v-4.5h-4.5V17H4.5a1 1 0 0 1-1-1V8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaitlistIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M5 5.5h10M5 10h10M5 14.5h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M3 5.5h.01M3 10h.01M3 14.5h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M4 15.5V7.75m4 7.75V4.5m4 11V9m4 6.5V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProgramsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16v11.5H5.5A1.5 1.5 0 0 0 4 17V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 7h6M7 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M3.5 6.5h13v8h-13v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3.5 8.75h13M6.5 12.25h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PartnersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M6.25 9.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM13.75 9.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM2.75 16c.55-2 1.8-3.25 3.5-3.25S9.2 14 9.75 16M10.25 16c.55-2 1.8-3.25 3.5-3.25S16.7 14 17.25 16"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M10 12.75A2.75 2.75 0 1 0 10 7.25a2.75 2.75 0 0 0 0 5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15.5 10a5.3 5.3 0 0 0-.08-.9l1.3-1-.95-1.65-1.55.65a5.9 5.9 0 0 0-1.55-.9L12.45 4.5h-1.9l-.22 1.7a5.9 5.9 0 0 0-1.55.9l-1.55-.65L6.28 8.1l1.3 1a5.3 5.3 0 0 0 0 1.8l-1.3 1 .95 1.65 1.55-.65c.47.39.99.69 1.55.9l.22 1.7h1.9l.22-1.7c.56-.21 1.08-.51 1.55-.9l1.55.65.95-1.65-1.3-1c.05-.3.08-.6.08-.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
