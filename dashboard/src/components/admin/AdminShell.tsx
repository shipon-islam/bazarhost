"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AuthProvider } from "./AuthContext";
import { Sidebar, SidebarBrand, SidebarNav } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * Client shell for every /admin page: collapsible desktop sidebar, mobile
 * drawer (with focus trap, Escape and scroll lock), top bar and content area.
 */
export function AdminShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = (): HTMLElement[] =>
      drawerRef.current
        ? Array.from(drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
        : [];
    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Close automatically if the window grows past the drawer breakpoint.
    const mq = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (mq.matches) setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    mq.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      mq.removeEventListener("change", onBreakpoint);
    };
  }, [mobileOpen, closeDrawer]);

  return (
    <AuthProvider user={user}>
      <div className="min-h-screen bg-gray-50">
        <a
          href="#main"
          className="sr-only z-[200] rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>

        <Sidebar collapsed={collapsed} />

        {/* Mobile / tablet drawer */}
        <div className={cn("fixed inset-0 z-40 lg:hidden", !mobileOpen && "pointer-events-none")}>
          <div
            onClick={closeDrawer}
            aria-hidden
            className={cn("absolute inset-0 bg-navy-950/60 transition-opacity duration-200", mobileOpen ? "opacity-100" : "opacity-0")}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            inert={!mobileOpen}
            className={cn(
              "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-900 shadow-2xl transition-transform duration-200",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="relative">
              <SidebarBrand collapsed={false} />
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
          <TopBar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onOpenMenu={() => setMobileOpen(true)}
            menuButtonRef={menuButtonRef}
          />
          {user.isMock && (
            <div role="note" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 sm:px-6">
              <strong className="font-semibold">Placeholder authentication &amp; mock data.</strong> Nothing here is saved, and access is
              not protected. See <code className="rounded bg-amber-100 px-1">src/lib/auth.ts</code>.
            </div>
          )}
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
