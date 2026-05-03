"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ControlSidebar } from "./control-sidebar";

type ControlTheme = "dark" | "light";

type ControlThemeContextValue = {
  theme: ControlTheme;
  setTheme: (theme: ControlTheme) => void;
};

const ControlThemeContext = createContext<ControlThemeContextValue | null>(null);

export function useControlTheme() {
  const ctx = useContext(ControlThemeContext);
  if (!ctx) {
    throw new Error("useControlTheme must be used inside ControlShell.");
  }
  return ctx;
}

export function ControlShell({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ControlTheme>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = window.localStorage.getItem("vitalrounds-control-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("vitalrounds-control-sidebar") === "collapsed";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: ControlTheme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem("vitalrounds-control-theme", nextTheme);
      },
    }),
    [theme],
  );

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("vitalrounds-control-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  const logoSrc = theme === "dark" ? "/logo-admin-dark.png" : "/logo-admin-light.png";

  return (
    <ControlThemeContext.Provider value={value}>
      <div
        data-control-theme={theme}
        className="control-shell flex min-h-screen flex-col bg-[var(--control-bg)] text-[var(--control-text)]"
      >
        <style>{controlThemeCss}</style>
        <header className="border-b border-[var(--control-border)] bg-[var(--control-header)]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--control-border)] text-[var(--control-muted)] transition hover:bg-[var(--control-hover)] hover:text-[var(--control-text)] md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--control-border)] text-[var(--control-muted)] transition hover:bg-[var(--control-hover)] hover:text-[var(--control-text)] md:inline-flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </button>
              <Link href="/control" className="inline-flex min-w-0 items-center gap-3">
                <Image
                  src={logoSrc}
                  alt="VitalRounds Control"
                  width={190}
                  height={42}
                  priority
                  className="h-auto w-[118px] sm:w-[150px]"
                />
              </Link>
            </div>
            <Link
              href="/auth/sign-out"
              className="shrink-0 rounded-full border border-[var(--control-border)] px-3 py-1.5 text-xs font-semibold text-[var(--control-muted)] transition hover:bg-[var(--control-hover)] hover:text-[var(--control-text)] sm:px-3.5"
            >
              Sign out
            </Link>
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <button
            type="button"
            aria-label="Close menu"
            className={
              mobileNavOpen
                ? "fixed inset-0 z-30 bg-black/45 opacity-100 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                : "pointer-events-none fixed inset-0 z-30 bg-black/45 opacity-0 backdrop-blur-sm transition-opacity duration-300 md:hidden"
            }
            onClick={() => setMobileNavOpen(false)}
          />
          <ControlSidebar
            collapsed={collapsed}
            mobileOpen={mobileNavOpen}
            onNavigate={() => setMobileNavOpen(false)}
          />
          <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
            {children}
          </main>
        </div>
      </div>
    </ControlThemeContext.Provider>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 6h12M4 10h12M4 14h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const controlThemeCss = `
  .control-shell[data-control-theme="dark"] {
    --control-bg: #1a241c;
    --control-surface: #2c3d2f;
    --control-surface-strong: #243329;
    --control-header: #2c3d2f;
    --control-border: #354a38;
    --control-text: #ffffff;
    --control-muted: #a6ccac;
    --control-soft: #cbecd0;
    --control-hover: #354a38;
    --control-active: #354a38;
    --control-table-border: #526656;
  }

  .control-shell[data-control-theme="light"] {
    --control-bg: #f4faf5;
    --control-surface: #ffffff;
    --control-surface-strong: #edf6ef;
    --control-header: #ffffff;
    --control-border: #c7ddcb;
    --control-text: #243329;
    --control-muted: #5f7362;
    --control-soft: #354a38;
    --control-hover: #dfeee2;
    --control-active: #d9eadc;
    --control-table-border: #aab6ad;
  }

  .control-shell[data-control-theme="light"] .text-white {
    color: #243329 !important;
  }
  .control-shell[data-control-theme="light"] .text-\\[\\#cbecd0\\] {
    color: #354a38 !important;
  }
  .control-shell[data-control-theme="light"] .text-\\[\\#a6ccac\\] {
    color: #5f7362 !important;
  }
  .control-shell[data-control-theme="light"] .text-\\[\\#7a9b80\\] {
    color: #6f8e74 !important;
  }
  .control-shell[data-control-theme="light"] .bg-\\[\\#1a241c\\],
  .control-shell[data-control-theme="light"] .bg-\\[\\#1f2d24\\],
  .control-shell[data-control-theme="light"] .bg-\\[\\#243329\\],
  .control-shell[data-control-theme="light"] .bg-\\[\\#2c3d2f\\] {
    background: linear-gradient(135deg, #ffffff 0%, #f3faf5 100%) !important;
  }
  .control-shell[data-control-theme="light"] .bg-\\[\\#1f2d24\\] {
    background: #f6fbf7 !important;
  }
  .control-shell[data-control-theme="light"] .bg-\\[\\#243329\\] {
    background: #edf6ef !important;
  }
  .control-shell[data-control-theme="light"] .bg-\\[\\#354a38\\] {
    background-color: #d9eadc !important;
  }
  .control-shell[data-control-theme="light"] .hover\\:bg-\\[\\#354a38\\]:hover {
    background-color: #dfeee2 !important;
  }
  .control-shell[data-control-theme="light"] .border-\\[\\#354a38\\],
  .control-shell[data-control-theme="light"] .border-\\[\\#5f7362\\],
  .control-shell[data-control-theme="light"] .border-\\[\\#445a47\\] {
    border-color: #c7ddcb !important;
  }
  .control-shell[data-control-theme="light"] .divide-\\[\\#354a38\\] > :not([hidden]) ~ :not([hidden]) {
    border-color: #d9eadc !important;
  }
`;
