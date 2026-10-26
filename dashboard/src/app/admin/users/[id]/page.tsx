import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { UserDetailView } from "../UserDetailView";

export const metadata: Metadata = { title: "User" };

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="users">
      <UserDetailView userId={id} />
    </RequirePermission>
  );
}
