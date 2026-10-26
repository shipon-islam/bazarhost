import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { UserFormLoader } from "../UserFormLoader";

export const metadata: Metadata = { title: "New user" };

export default function CreateUserPage() {
  return (
    <RequirePermission module="users" action="create">
      <PageHeader title="Add user" backHref="/admin/users" backLabel="Back to users" />
      <UserFormLoader />
    </RequirePermission>
  );
}
