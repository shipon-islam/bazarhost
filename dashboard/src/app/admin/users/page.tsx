import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { UsersView } from "./UsersView";

export const metadata: Metadata = { title: "Customers & Users" };

export default function UsersPage() {
  return (
    <RequirePermission module="users">
      <UsersView />
    </RequirePermission>
  );
}
