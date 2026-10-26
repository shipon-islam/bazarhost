export const PERMISSION_MODULES = [
  "products",
  "categories",
  "orders",
  "users",
  "roles",
  "reports",
  "settings",
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionMap = Record<PermissionModule, PermissionAction[]>;

export interface Role {
  id: string;
  name: string;
  description: string;
  /** System roles cannot be deleted. */
  isSystem: boolean;
  permissions: PermissionMap;
}

export interface RoleWithCount extends Role {
  userCount: number;
}

export type RoleInput = Pick<Role, "name" | "description" | "permissions">;

export const MODULE_LABELS: Record<PermissionModule, string> = {
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  users: "Users",
  roles: "Roles & permissions",
  reports: "Reports",
  settings: "Settings",
};
