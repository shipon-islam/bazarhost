import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { CategoryFormLoader } from "../CategoryFormLoader";

export const metadata: Metadata = { title: "New category" };

export default function CreateCategoryPage() {
  return (
    <RequirePermission module="categories" action="create">
      <PageHeader title="Add category" backHref="/admin/categories" backLabel="Back to categories" />
      <CategoryFormLoader />
    </RequirePermission>
  );
}
