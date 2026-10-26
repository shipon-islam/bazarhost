import { ALL_PERMISSIONS } from '../config/constants.js';

export const effectivePermissions = (user) =>
  user?.role?.isSuperAdmin ? ALL_PERMISSIONS : user?.role?.permissions ?? [];

export const hasPermission = (user, perm) =>
  user?.role?.isSuperAdmin === true || (user?.role?.permissions ?? []).includes(perm);

export const hasAnyPermission = (user, perms) => perms.some((p) => hasPermission(user, p));

/**
 * Privilege-escalation guard: a non-super-admin may only manage / assign roles whose
 * permissions are a subset of their own, and never the Super Admin role.
 */
export function canManageRole(actor, role) {
  if (!role) return false;
  if (actor.role?.isSuperAdmin) return true;
  if (role.isSuperAdmin) return false;
  const mine = new Set(actor.role?.permissions ?? []);
  return (role.permissions ?? []).every((p) => mine.has(p));
}

/** Any create/edit/delete permission implies view for that module. */
export function normalizePermissions(perms = []) {
  const set = new Set(perms);
  for (const p of perms) {
    const [mod] = p.split(':');
    set.add(`${mod}:view`);
  }
  return ALL_PERMISSIONS.filter((p) => set.has(p));
}
