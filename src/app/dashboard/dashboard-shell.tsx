"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

const IDLE_SIGN_OUT_MS = 10 * 60 * 1000;

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/dashboard/programs", label: "Browse Programs", icon: ProgramsIcon },
  { href: "/dashboard/enrollments", label: "My Enrollments", icon: TimelineIcon },
  { href: "/dashboard/payments", label: "Payments", icon: PaymentsIcon },
] as const;

const themeOptions = [
  {
    id: "dark",
    title: "Dark olive",
    description: "Current doctor portal look with deep green surfaces and soft mint text.",
    swatches: ["#1a241c", "#2c3d2f", "#759d7b", "#cbecd0"],
  },
  {
    id: "light",
    title: "Light olive",
    description: "A brighter professional workspace using warm whites and muted olive accents.",
    swatches: ["#f4faf5", "#ffffff", "#d9eadc", "#5f7362"],
  },
] as const;

export function DoctorPortalShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("vitalrounds-doctor-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    const savedSidebar = window.localStorage.getItem("vitalrounds-doctor-sidebar");
    if (savedSidebar === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    let timeoutId = window.setTimeout(() => {
      window.location.assign("/auth/sign-out");
    }, IDLE_SIGN_OUT_MS);

    const resetIdleTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        window.location.assign("/auth/sign-out");
      }, IDLE_SIGN_OUT_MS);
    };

    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
    };
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("vitalrounds-doctor-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  const logoSrc = theme === "dark" ? "/logo_white.png" : "/logo.png";
  const initials = getInitials(userName);

  return (
    <div
      data-doctor-theme={theme}
      className="doctor-shell flex min-h-screen flex-col bg-[var(--doctor-bg)] text-[var(--doctor-text)]"
    >
      <style>{doctorThemeCss}</style>
      <header className="border-b border-[var(--doctor-border)] bg-[var(--doctor-header)]">
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--doctor-border)] text-[var(--doctor-muted)] transition hover:bg-[var(--doctor-hover)] hover:text-[var(--doctor-text)]"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
            <Link href="/dashboard" className="inline-flex items-center">
              <Image
                src={logoSrc}
                alt="VitalRounds Doctor Portal"
                width={190}
                height={42}
                priority
                className="h-auto w-[130px] sm:w-[150px]"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[var(--doctor-muted)] sm:inline">
              Hi {userName}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#759d7b] text-xs font-bold text-white shadow-sm ring-2 ring-transparent transition hover:scale-105 hover:bg-[#5f8f68] hover:ring-[var(--doctor-border)] focus:outline-none focus:ring-2 focus:ring-[#9bd4a4]"
                aria-label="Open account menu"
                aria-expanded={menuOpen}
              >
                {initials}
              </button>
              <div
                className={
                  menuOpen
                    ? "absolute right-0 z-20 mt-2 w-44 translate-y-0 overflow-hidden rounded-2xl border border-[var(--doctor-border)] bg-[var(--doctor-surface)] p-2 opacity-100 shadow-xl transition duration-200 ease-out"
                    : "pointer-events-none absolute right-0 z-20 mt-2 w-44 -translate-y-2 overflow-hidden rounded-2xl border border-[var(--doctor-border)] bg-[var(--doctor-surface)] p-2 opacity-0 shadow-xl transition duration-200 ease-out"
                }
              >
                <Link
                  href="/dashboard/profile"
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--doctor-soft)] hover:bg-[var(--doctor-hover)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/dashboard/payments"
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--doctor-soft)] hover:bg-[var(--doctor-hover)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Billing
                </Link>
                <Link
                  href="/auth/sign-out"
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--doctor-soft)] hover:bg-[var(--doctor-hover)]"
                >
                  Sign out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={
            collapsed
              ? "w-16 shrink-0 overflow-hidden border-r border-[var(--doctor-border)] bg-[var(--doctor-surface-strong)] transition-[width] duration-300 ease-in-out"
              : "w-56 shrink-0 overflow-hidden border-r border-[var(--doctor-border)] bg-[var(--doctor-surface-strong)] transition-[width] duration-300 ease-in-out"
          }
        >
          <nav
            className={
              collapsed
                ? "sticky top-0 flex h-full min-h-0 w-16 flex-col gap-1 px-2 py-4"
                : "sticky top-0 flex h-full min-h-0 w-56 flex-col gap-1 px-3 py-4"
            }
            aria-label="Doctor portal"
          >
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--doctor-muted)]">
                Navigate
              </p>
            )}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-xl bg-[var(--doctor-active)] px-3 py-2.5 text-sm font-medium text-[var(--doctor-text)]"
                        : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--doctor-soft)] hover:bg-[var(--doctor-hover)] hover:text-[var(--doctor-text)]"
                    }
                  >
                    <Icon />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
            <div className="mt-auto border-t border-[var(--doctor-border)] pt-3">
              <Link
                href="/dashboard/settings"
                title={collapsed ? "Settings" : undefined}
                className={
                  pathname === "/dashboard/settings"
                    ? "flex items-center gap-3 rounded-xl bg-[var(--doctor-active)] px-3 py-2.5 text-sm font-medium text-[var(--doctor-text)]"
                    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--doctor-soft)] hover:bg-[var(--doctor-hover)] hover:text-[var(--doctor-text)]"
                }
              >
                <SettingsIcon />
                {!collapsed && <span>Settings</span>}
              </Link>
            </div>
          </nav>
        </aside>
        <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}

export function DoctorThemeSettings() {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = window.localStorage.getItem("vitalrounds-doctor-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  function update(next: Theme) {
    setTheme(next);
    window.localStorage.setItem("vitalrounds-doctor-theme", next);
    window.location.reload();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {themeOptions.map((option) => {
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => update(option.id)}
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
  const first = parts[0]?.[0] ?? "D";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${first}${last}`.toUpperCase();
}

function ChevronLeftIcon() {
  return <IconPath d="M12.5 4.5 7 10l5.5 5.5" />;
}

function ChevronRightIcon() {
  return <IconPath d="M7.5 4.5 13 10l-5.5 5.5" />;
}

function HomeIcon() {
  return <IconPath d="M3.5 8.5 10 3l6.5 5.5V16a1 1 0 0 1-1 1h-3.25v-4.5h-4.5V17H4.5a1 1 0 0 1-1-1V8.5Z" />;
}

function ProgramsIcon() {
  return <IconPath d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16v11.5H5.5A1.5 1.5 0 0 0 4 17V5.5ZM7 7h6M7 10h5" />;
}

function TimelineIcon() {
  return <IconPath d="M4 5h3m3 0h6M4 10h8m3 0h1M4 15h5m3 0h4" />;
}

function PaymentsIcon() {
  return <IconPath d="M3.5 6.5h13v8h-13v-8ZM3.5 8.75h13M6.5 12.25h3" />;
}

function SettingsIcon() {
  return <IconPath d="M10 12.75A2.75 2.75 0 1 0 10 7.25a2.75 2.75 0 0 0 0 5.5ZM15.5 10a5.3 5.3 0 0 0-.08-.9l1.3-1-.95-1.65-1.55.65a5.9 5.9 0 0 0-1.55-.9L12.45 4.5h-1.9l-.22 1.7a5.9 5.9 0 0 0-1.55.9l-1.55-.65L6.28 8.1l1.3 1a5.3 5.3 0 0 0 0 1.8l-1.3 1 .95 1.65 1.55-.65c.47.39.99.69 1.55.9l.22 1.7h1.9l.22-1.7c.56-.21 1.08-.51 1.55-.9l1.55.65.95-1.65-1.3-1c.05-.3.08-.6.08-.9Z" />;
}

function IconPath({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const doctorThemeCss = `
  .doctor-shell[data-doctor-theme="dark"] {
    --doctor-bg: #1a241c;
    --doctor-surface: #2c3d2f;
    --doctor-surface-strong: #243329;
    --doctor-header: #2c3d2f;
    --doctor-border: #354a38;
    --doctor-text: #ffffff;
    --doctor-muted: #a6ccac;
    --doctor-soft: #cbecd0;
    --doctor-hover: #354a38;
    --doctor-active: #354a38;
  }
  .doctor-shell[data-doctor-theme="light"] {
    --doctor-bg: #f4faf5;
    --doctor-surface: #ffffff;
    --doctor-surface-strong: #edf6ef;
    --doctor-header: #ffffff;
    --doctor-border: #c7ddcb;
    --doctor-text: #243329;
    --doctor-muted: #5f7362;
    --doctor-soft: #354a38;
    --doctor-hover: #dfeee2;
    --doctor-active: #d9eadc;
  }
  .doctor-shell[data-doctor-theme="light"] .text-white { color: #243329 !important; }
  .doctor-shell[data-doctor-theme="light"] .text-\\[\\#cbecd0\\] { color: #354a38 !important; }
  .doctor-shell[data-doctor-theme="light"] .text-\\[\\#a6ccac\\],
  .doctor-shell[data-doctor-theme="light"] .text-\\[\\#86aa8d\\] { color: #5f7362 !important; }
  .doctor-shell[data-doctor-theme="light"] .text-\\[\\#9bd4a4\\] { color: #4f7e57 !important; }
  .doctor-shell[data-doctor-theme="light"] .bg-\\[\\#0f1f14\\],
  .doctor-shell[data-doctor-theme="light"] .bg-\\[\\#132318\\],
  .doctor-shell[data-doctor-theme="light"] .bg-\\[\\#1a2b1e\\] {
    background: linear-gradient(135deg, #ffffff 0%, #f3faf5 100%) !important;
  }
  .doctor-shell[data-doctor-theme="light"] .bg-\\[\\#243329\\] { background: #edf6ef !important; }
  .doctor-shell[data-doctor-theme="light"] .bg-\\[\\#28452f\\] { background: #d9eadc !important; }
  .doctor-shell[data-doctor-theme="light"] .border-\\[\\#354a38\\],
  .doctor-shell[data-doctor-theme="light"] .border-\\[\\#223a29\\] { border-color: #c7ddcb !important; }
`;
