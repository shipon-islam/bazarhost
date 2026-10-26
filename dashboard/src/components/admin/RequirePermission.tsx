"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { PermissionAction, PermissionModule } from "@/types/role";
import { useCan } from "./AuthContext";
import { EmptyState } from "./EmptyState";
import { LinkButton } from "@/components/ui/button";

/**
 * Hides a page the current user shouldn't see. UI convenience only: the API
 * must enforce the same permission server-side.
 */
export function RequirePermission({
  module,
  action = "view",
  children,
}: {
  module: PermissionModule;
  action?: PermissionAction;
  children: ReactNode;
}) {
  const can = useCan();
  if (can(module, action)) return <>{children}</>;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description={`Your role can't ${action} ${module}. Ask a Super Admin if you need access.`}
        action={<LinkButton href="/admin" variant="secondary">Back to dashboard</LinkButton>}
      />
    </div>
  );
}
