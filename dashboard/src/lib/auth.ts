/**
 * SERVER-SIDE auth boundary for /admin. Import this from Server Components only.
 *
 * !!! THIS IS A PLACEHOLDER, NOT REAL AUTHENTICATION !!!
 *
 * The repo has no backend or identity provider yet, so we deliberately do NOT
 * invent a login form or a forgeable cookie. Instead:
 *
 *  - In development (NODE_ENV !== "production") a clearly labelled MOCK user is
 *    returned so the UI can be explored.
 *  - In production the admin is LOCKED (returns null → "Access Denied") unless
 *    ALLOW_MOCK_AUTH=true is set, which should only be used for private demos.
 *
 * To go live, replace the body of `getCurrentUser()` with a real session lookup
 * (NextAuth `auth()`, a verified JWT in an httpOnly cookie, etc.) that returns
 * the user's role and permissions as issued by YOUR backend. Every API route /
 * backend endpoint must ALSO re-check permissions: UI checks are cosmetic.
 */
import { fullPermissions } from "@/lib/permissions";
import type { PermissionMap } from "@/types/role";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: PermissionMap;
  /** True when this identity is the development placeholder. */
  isMock: boolean;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const mockAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_AUTH === "true";
  if (!mockAllowed) return null;

  // TODO(auth): replace with a real session lookup.
  return {
    id: "u-1",
    name: "Tanvir Rahman",
    email: "admin@bazarhost.com",
    roleName: "Super Admin",
    permissions: fullPermissions(),
    isMock: true,
  };
}
