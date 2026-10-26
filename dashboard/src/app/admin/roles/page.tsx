import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { RolesView } from "./RolesView";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default function RolesPage() {
  return (
    <RequirePermission module="roles">
      <RolesView />
    </RequirePermission>
  );
}
