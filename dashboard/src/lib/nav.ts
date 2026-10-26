import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PermissionModule } from "@/types/role";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Hidden from the menu when the user lacks `view` on this module. */
  module?: PermissionModule;
  group: "main" | "people" | "system";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/admin/products", label: "Products", icon: Package, module: "products", group: "main" },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, module: "categories", group: "main" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, module: "orders", group: "main" },
  { href: "/admin/users", label: "Customers & Users", icon: Users, module: "users", group: "people" },
  { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, module: "roles", group: "people" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, module: "reports", group: "system" },
  { href: "/admin/settings", label: "Settings", icon: Settings, module: "settings", group: "system" },
];

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  users: "Users",
  roles: "Roles & Permissions",
  reports: "Reports",
  settings: "Settings",
  create: "New",
  edit: "Edit",
};

export interface Crumb {
  label: string;
  href: string;
}

/** Builds breadcrumbs from the pathname. Dynamic id segments become "Details". */
export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let href = "";
  segments.forEach((seg, i) => {
    href += `/${seg}`;
    const known = SEGMENT_LABELS[seg];
    const prev = segments[i - 1];
    const label = known ?? (prev === "orders" ? `Order ${seg}` : "Details");
    crumbs.push({ label, href });
  });
  return crumbs;
}
