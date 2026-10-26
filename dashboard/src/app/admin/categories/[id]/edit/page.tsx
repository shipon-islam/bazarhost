import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { CategoryFormLoader } from "../../CategoryFormLoader";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="categories" action="edit">
      <PageHeader title="Edit category" backHref="/admin/categories" backLabel="Back to categories" />
      <CategoryFormLoader categoryId={id} />
    </RequirePermission>
  );
}
