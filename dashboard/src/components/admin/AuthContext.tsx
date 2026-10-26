"use client";

import { createContext, useContext, type ReactNode } from "react";
import { can } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth";
import type { PermissionAction, PermissionModule } from "@/types/role";

const AuthContext = createContext<SessionUser | null>(null);

export function AuthProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): SessionUser {
  const user = useContext(AuthContext);
  if (!user) throw new Error("useAuth must be used inside <AuthProvider>");
  return user;
}

/**
 * UI-only permission check (hides/disables controls). The backend MUST enforce
 * the same rule on every request: this is not a security boundary.
 */
export function useCan() {
  const user = useAuth();
  return (module: PermissionModule, action: PermissionAction) => can(user.permissions, module, action);
}
