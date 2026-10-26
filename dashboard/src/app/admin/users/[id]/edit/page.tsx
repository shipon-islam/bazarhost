import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { UserFormLoader } from "../../UserFormLoader";

export const metadata: Metadata = { title: "Edit user" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="users" action="edit">
      <PageHeader title="Edit user" backHref="/admin/users" backLabel="Back to users" />
      <UserFormLoader userId={id} />
    </RequirePermission>
  );
}
