import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionMap,
  type PermissionModule,
} from "@/types/role";

/**
 * UI-level permission check. This only decides what to SHOW. Real enforcement
 * must happen on the server for every API call: never rely on this alone.
 */
export function can(
  permissions: PermissionMap | undefined,
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  return permissions?.[module]?.includes(action) ?? false;
}

export function emptyPermissions(): PermissionMap {
  return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, [] as PermissionAction[]])) as PermissionMap;
}

export function fullPermissions(): PermissionMap {
  return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, [...PERMISSION_ACTIONS]])) as PermissionMap;
}

/** Human-readable one-liner, e.g. "Can view and edit products; cannot delete orders." */
export function summarizePermissions(p: PermissionMap): string {
  const entries = PERMISSION_MODULES.map((m) => ({ m, a: p[m] ?? [] }));
  const granted = entries.filter((e) => e.a.length > 0);
  if (granted.length === 0) return "No admin permissions.";
  if (granted.every((e) => e.a.length === PERMISSION_ACTIONS.length) && granted.length === PERMISSION_MODULES.length) {
    return "Full access to every module.";
  }
  const list = (a: PermissionAction[]) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}` : (a[0] ?? ""));
  const can_ = granted.map((e) => `${list(e.a)} ${e.m}`);
  const cannotDelete = granted.filter((e) => !e.a.includes("delete")).map((e) => e.m);
  let text = `Can ${can_.join("; ")}.`;
  if (cannotDelete.length > 0 && cannotDelete.length <= 3) text += ` Cannot delete ${cannotDelete.join(", ")}.`;
  return text;
}
