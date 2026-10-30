"use client";

import { logoutAuth } from "@/actions/auth";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { LogOut, Store } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCan } from "./AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";

const GROUP_ORDER: NavItem["group"][] = ["main", "people", "system"];

function isActive(pathname: string, href: string): boolean {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Tooltip shown next to an icon when the sidebar is collapsed. */
function Tip({ children }: { children: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

const itemBase =
  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-offset-0";

export function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/admin"
      className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-[18px] text-white"
      aria-label="BazarHost Admin: go to dashboard"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
        <Store className="h-5 w-5" aria-hidden />
      </span>
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-base font-bold tracking-tight">
            BazarHost
          </span>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Admin
          </span>
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const can = useCan();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleLogout() {
    try {
      setLoading(true);
      await logoutAuth();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }
  const visible = NAV_ITEMS.filter(
    (item) => !item.module || can(item.module, "view"),
  );

  return (
    <nav
      aria-label="Main"
      className={cn(
        "flex min-h-0 flex-1 flex-col px-3 py-4",
        collapsed ? "overflow-visible" : "overflow-y-auto",
      )}
    >
      {GROUP_ORDER.map((group, gi) => {
        const items = visible.filter((i) => i.group === group);
        if (items.length === 0) return null;
        return (
          <div
            key={group}
            className={cn(gi > 0 && "mt-4 border-t border-white/10 pt-4")}
          >
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        itemBase,
                        collapsed && "justify-center",
                        active
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-slate-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      <span className={collapsed ? "sr-only" : "truncate"}>
                        {item.label}
                      </span>
                      {collapsed && <Tip>{item.label}</Tip>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="mt-auto border-t border-white/10 pt-4">
        <ConfirmDialog
          loading={loading}
          open={isPopupOpen}
          tone="danger"
          onCancel={() => setIsPopupOpen(false)}
          onConfirm={handleLogout}
          confirmLabel="Logout"
          title="Confirm Logout?"
          description=" Are you sure you want to log out of your account?
              You will need to sign in again to access your dashboard."
        />
        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          className={cn(
            itemBase,
            "w-full text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          <span className={collapsed ? "sr-only" : "truncate"}>Logout</span>
          {collapsed && <Tip>Logout</Tip>}
        </button>
      </div>
    </nav>
  );
}

/** Desktop sidebar (≥ lg). On smaller screens the AdminShell renders SidebarNav in a drawer. */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col bg-navy-900 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarNav collapsed={collapsed} />
    </aside>
  );
}
