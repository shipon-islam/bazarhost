import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { CategoriesView } from "./CategoriesView";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <RequirePermission module="categories">
      <CategoriesView />
    </RequirePermission>
  );
}
