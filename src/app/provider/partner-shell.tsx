"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PartnerTheme = "dark" | "light";

type PartnerThemeContextValue = {
  theme: PartnerTheme;
  setTheme: (theme: PartnerTheme) => void;
};

const PartnerThemeContext = createContext<PartnerThemeContextValue | null>(null);

const navItems = [
  { href: "/provider/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/provider/applications", label: "Applications", icon: ApplicationsIcon },
  { href: "/provider/enrolled", label: "Enrolled Applicants", icon: PeopleIcon },
  { href: "/provider/program", label: "Program Details", icon: ProgramIcon },
] as const;

const themeOptions = [
  {
    id: "dark",
    title: "Dark olive",
    description: "Partner workspace with deep green surfaces and soft mint text.",
    swatches: ["#1a241c", "#2c3d2f", "#759d7b", "#cbecd0"],
  },
  {
    id: "light",
    title: "Light olive",
    description: "Bright workspace using warm whites and muted olive accents.",
    swatches: ["#f4faf5", "#ffffff", "#d9eadc", "#5f7362"],
  },
] as const;

export function usePartnerTheme() {
  const ctx = useContext(PartnerThemeContext);
  if (!ctx) throw new Error("usePartnerTheme must be used inside PartnerPortalShell.");
  return ctx;
}

export function PartnerPortalShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<PartnerTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = window.localStorage.getItem("vitalrounds-partner-theme");
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "dark";
  });
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("vitalrounds-partner-sidebar") === "collapsed";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: PartnerTheme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem("vitalrounds-partner-theme", nextTheme);
      },
    }),
    [theme],
  );

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("vitalrounds-partner-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  const logoSrc = theme === "dark" ? "/logo_white.png" : "/logo.png";
  const initials = getInitials(userName);
  const effectiveCollapsed = mobileNavOpen ? false : collapsed;

  return (
    <PartnerThemeContext.Provider value={value}>
      <div
        data-partner-theme={theme}
        className="partner-shell flex min-h-screen flex-col bg-[var(--partner-bg)] text-[var(--partner-text)]"
      >
        <style>{partnerThemeCss}</style>
        <header className="border-b border-[var(--partner-border)] bg-[var(--partner-header)]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--partner-border)] text-[var(--partner-muted)] transition hover:bg-[var(--partner-hover)] hover:text-[var(--partner-text)] md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--partner-border)] text-[var(--partner-muted)] transition hover:bg-[var(--partner-hover)] hover:text-[var(--partner-text)] md:inline-flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </button>
              <Link href="/provider/dashboard" className="inline-flex min-w-0 items-center">
                <Image
                  src={logoSrc}
                  alt="VitalRounds Partner Portal"
                  width={190}
                  height={42}
                  priority
                  className="h-auto w-[118px] sm:w-[150px]"
                />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-semibold text-[var(--partner-muted)] sm:inline">
                Hi {userName}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#759d7b] text-xs font-bold text-white shadow-sm ring-2 ring-transparent transition hover:scale-105 hover:bg-[#5f8f68] hover:ring-[var(--partner-border)] focus:outline-none focus:ring-2 focus:ring-[#9bd4a4]"
                  aria-label="Open account menu"
                  aria-expanded={menuOpen}
                >
                  {initials}
                </button>
                <div
                  className={
                    menuOpen
                      ? "absolute right-0 z-20 mt-2 w-44 translate-y-0 overflow-hidden rounded-2xl border border-[var(--partner-border)] bg-[var(--partner-surface)] p-2 opacity-100 shadow-xl transition duration-200 ease-out"
                      : "pointer-events-none absolute right-0 z-20 mt-2 w-44 -translate-y-2 overflow-hidden rounded-2xl border border-[var(--partner-border)] bg-[var(--partner-surface)] p-2 opacity-0 shadow-xl transition duration-200 ease-out"
                  }
                >
                  <Link
                    href="/provider/account"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--partner-soft)] hover:bg-[var(--partner-hover)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <Link
                    href="/auth/sign-out"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--partner-soft)] hover:bg-[var(--partner-hover)]"
                  >
                    Sign out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {mobileNavOpen && (
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
          <aside
            className={
              mobileNavOpen
                ? "fixed inset-y-0 left-0 z-40 w-64 overflow-hidden border-r border-[var(--partner-border)] bg-[var(--partner-surface-strong)] shadow-2xl transition-transform duration-300 ease-in-out md:static md:shadow-none"
                : collapsed
                  ? "hidden w-16 shrink-0 overflow-hidden border-r border-[var(--partner-border)] bg-[var(--partner-surface-strong)] transition-[width] duration-300 ease-in-out md:block"
                  : "hidden w-60 shrink-0 overflow-hidden border-r border-[var(--partner-border)] bg-[var(--partner-surface-strong)] transition-[width] duration-300 ease-in-out md:block"
            }
          >
            <nav
              className={
                effectiveCollapsed
                  ? "sticky top-0 flex h-full min-h-0 w-16 flex-col gap-1 px-2 py-4"
                  : "sticky top-0 flex h-full min-h-0 w-64 flex-col gap-1 px-3 py-4 md:w-60"
              }
              aria-label="Partner portal"
            >
              {!effectiveCollapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--partner-muted)]">
                  Navigate
                </p>
              )}
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={effectiveCollapsed ? item.label : undefined}
                      onClick={() => setMobileNavOpen(false)}
                      className={
                        active
                          ? "flex items-center gap-3 rounded-xl bg-[var(--partner-active)] px-3 py-2.5 text-sm font-medium text-[var(--partner-text)]"
                          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--partner-soft)] hover:bg-[var(--partner-hover)] hover:text-[var(--partner-text)]"
                      }
                    >
                      <Icon />
                      {!effectiveCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-auto border-t border-[var(--partner-border)] pt-3">
                <Link
                  href="/provider/settings"
                  title={effectiveCollapsed ? "Settings" : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  className={
                    pathname === "/provider/settings"
                      ? "flex items-center gap-3 rounded-xl bg-[var(--partner-active)] px-3 py-2.5 text-sm font-medium text-[var(--partner-text)]"
                      : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--partner-soft)] hover:bg-[var(--partner-hover)] hover:text-[var(--partner-text)]"
                  }
                >
                  <SettingsIcon />
                  {!effectiveCollapsed && <span>Settings</span>}
                </Link>
              </div>
            </nav>
          </aside>
          <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
            {children}
          </main>
        </div>
      </div>
    </PartnerThemeContext.Provider>
  );
}

export function PartnerThemeSettings() {
  const { theme, setTheme } = usePartnerTheme();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {themeOptions.map((option) => {
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            className={
              active
                ? "rounded-2xl border border-[#759d7b] bg-[#354a38] p-5 text-left shadow-sm"
                : "rounded-2xl border border-[#354a38] bg-[#2c3d2f] p-5 text-left transition hover:border-[#759d7b]"
            }
            aria-pressed={active}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{option.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#a6ccac]">{option.description}</p>
              </div>
              <span
                className={
                  active
                    ? "rounded-full bg-[#759d7b] px-3 py-1 text-xs font-semibold text-white"
                    : "rounded-full border border-[#5f7362] px-3 py-1 text-xs font-semibold text-[#cbecd0]"
                }
              >
                {active ? "Active" : "Use"}
              </span>
            </div>
            <div className="mt-5 flex gap-2">
              {option.swatches.map((swatch) => (
                <span
                  key={swatch}
                  className="h-8 flex-1 rounded-full border border-black/10"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""}`.toUpperCase();
}

function ChevronLeftIcon() {
  return <IconPath d="M12.5 4.5 7 10l5.5 5.5" />;
}

function ChevronRightIcon() {
  return <IconPath d="M7.5 4.5 13 10l-5.5 5.5" />;
}

function MenuIcon() {
  return <IconPath d="M4 6h12M4 10h12M4 14h12" />;
}

function HomeIcon() {
  return <IconPath d="M3.5 8.5 10 3l6.5 5.5V16a1 1 0 0 1-1 1h-3.25v-4.5h-4.5V17H4.5a1 1 0 0 1-1-1V8.5Z" />;
}

function ApplicationsIcon() {
  return <IconPath d="M5 4h8l2 2v10H5V4ZM8 8h4M8 11h4M8 14h2" />;
}

function PeopleIcon() {
  return <IconPath d="M6.25 9.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM13.75 9.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM2.75 16c.55-2 1.8-3.25 3.5-3.25S9.2 14 9.75 16M10.25 16c.55-2 1.8-3.25 3.5-3.25S16.7 14 17.25 16" />;
}

function ProgramIcon() {
  return <IconPath d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16v11.5H5.5A1.5 1.5 0 0 0 4 17V5.5ZM7 7h6M7 10h5" />;
}

function SettingsIcon() {
  return <IconPath d="M10 12.75A2.75 2.75 0 1 0 10 7.25a2.75 2.75 0 0 0 0 5.5ZM15.5 10a5.3 5.3 0 0 0-.08-.9l1.3-1-.95-1.65-1.55.65a5.9 5.9 0 0 0-1.55-.9L12.45 4.5h-1.9l-.22 1.7a5.9 5.9 0 0 0-1.55.9l-1.55-.65L6.28 8.1l1.3 1a5.3 5.3 0 0 0 0 1.8l-1.3 1 .95 1.65 1.55-.65c.47.39.99.69 1.55.9l.22 1.7h1.9l.22-1.7c.56-.21 1.08-.51 1.55-.9l1.55.65.95-1.65-1.3-1c.05-.3.08-.6.08-.9Z" />;
}

function IconPath({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const partnerThemeCss = `
  .partner-shell[data-partner-theme="dark"] {
    --partner-bg: #1a241c;
    --partner-surface: #2c3d2f;
    --partner-surface-strong: #243329;
    --partner-header: #2c3d2f;
    --partner-border: #354a38;
    --partner-text: #ffffff;
    --partner-muted: #a6ccac;
    --partner-soft: #cbecd0;
    --partner-hover: #425f48;
    --partner-active: #354a38;
  }
  .partner-shell[data-partner-theme="light"] {
    --partner-bg: #f4faf5;
    --partner-surface: #ffffff;
    --partner-surface-strong: #edf6ef;
    --partner-header: #ffffff;
    --partner-border: #c7ddcb;
    --partner-text: #243329;
    --partner-muted: #5f7362;
    --partner-soft: #354a38;
    --partner-hover: #dfeee2;
    --partner-active: #d9eadc;
  }
  .partner-shell[data-partner-theme="light"] .text-white { color: #243329 !important; }
  .partner-shell[data-partner-theme="light"] .text-\\[\\#cbecd0\\] { color: #354a38 !important; }
  .partner-shell[data-partner-theme="light"] .text-\\[\\#a6ccac\\],
  .partner-shell[data-partner-theme="light"] .text-\\[\\#86aa8d\\] { color: #5f7362 !important; }
  .partner-shell[data-partner-theme="light"] .bg-\\[\\#1a2b1e\\] {
    background: linear-gradient(135deg, #ffffff 0%, #f3faf5 100%) !important;
  }
  .partner-shell[data-partner-theme="light"] .bg-\\[\\#243329\\] { background: #edf6ef !important; }
  .partner-shell[data-partner-theme="light"] .border-\\[\\#223a29\\],
  .partner-shell[data-partner-theme="light"] .border-\\[\\#354a38\\] { border-color: #c7ddcb !important; }
`;
