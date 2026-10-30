"use client";

import { logoutAuth } from "@/actions/auth";
import { Dropdown } from "@/components/ui/dropdown";
import { buildCrumbs } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type RefObject } from "react";
import { useAuth } from "./AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";

function GlobalSearch({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(
      term
        ? `/admin/products?q=${encodeURIComponent(term)}`
        : "/admin/products",
    );
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm placeholder:text-gray-500 hover:border-gray-300 focus:border-brand-500 focus:bg-white"
      />
    </form>
  );
}

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "New order received",
    body: "Order BH-10520 · ৳3,140",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    title: "Low stock",
    body: "Electric Kettle 1.8L has 3 left",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 3,
    title: "Weekly summary ready",
    body: "Your sales report is available",
    time: "Yesterday",
    unread: false,
  },
];

function Notifications() {
  const unread = SAMPLE_NOTIFICATIONS.filter((n) => n.unread).length;
  return (
    <Dropdown
      label={`Notifications, ${unread} unread`}
      buttonClassName="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      buttonContent={
        <>
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            />
          )}
        </>
      }
      panelClassName="w-80 max-w-[calc(100vw-2rem)]"
    >
      {() => (
        <div>
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {/* TODO(api): replace with real notifications feed. */}
            <p className="text-xs text-gray-500">
              Placeholder content for the design.
            </p>
          </div>
          <ul className="divide-y divide-gray-100 border-t border-gray-100">
            {SAMPLE_NOTIFICATIONS.map((n) => (
              <li key={n.id} className="flex gap-3 px-3 py-2.5">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    n.unread ? "bg-brand-600" : "bg-transparent",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {n.title}
                    {n.unread && <span className="sr-only"> (unread)</span>}
                  </p>
                  <p className="truncate text-xs text-gray-600">{n.body}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dropdown>
  );
}

function UserMenu() {
  const user = useAuth();
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
  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900";

  return (
    <Dropdown
      label="Open user menu"
      buttonClassName="flex items-center gap-2.5 rounded-lg p-1 pr-2 transition-colors hover:bg-gray-100"
      buttonContent={
        <>
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
          >
            {initials(user.name)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-32 truncate text-sm font-medium text-gray-900">
              {user.name}
            </span>
            <span className="block text-xs text-gray-500">{user.roleName}</span>
          </span>
        </>
      }
      panelClassName="w-64"
    >
      {(close) => (
        <div>
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="border-b border-gray-100 p-2 md:hidden">
            {/* Search moves into the menu on narrow screens. */}
            <GlobalSearch onDone={close} />
          </div>
          <div className="pt-1.5">
            <Link
              href="/admin/settings?tab=profile"
              onClick={close}
              className={itemClass}
            >
              <UserIcon className="h-4 w-4" aria-hidden /> Profile
            </Link>
            <Link href="/admin/settings" onClick={close} className={itemClass}>
              <Settings className="h-4 w-4" aria-hidden /> Settings
            </Link>
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
                itemClass,
                "text-red-700 hover:bg-red-50 hover:text-red-800",
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden /> Logout
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  );
}

export function TopBar({
  collapsed,
  onToggleCollapse,
  onOpenMenu,
  menuButtonRef,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMenu: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  const current = crumbs[crumbs.length - 1];

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className={cn(iconBtn, "lg:hidden")}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        className={cn(iconBtn, "hidden lg:flex")}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden />
        )}
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        {/* Narrow screens: just the current section. */}
        <p className="truncate text-sm font-semibold text-gray-900 md:hidden">
          {current?.label}
        </p>
        <ol className="hidden items-center gap-1.5 text-sm md:flex">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-gray-400"
                    aria-hidden
                  />
                )}
                {last ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-gray-900"
                  >
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="text-gray-500 transition-colors hover:text-gray-900"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <GlobalSearch className="hidden w-64 md:block lg:w-72" />
      <Notifications />
      <UserMenu />
    </header>
  );
}
