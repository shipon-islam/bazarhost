import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductFormLoader } from "../ProductFormLoader";

export const metadata: Metadata = { title: "New product" };

export default function CreateProductPage() {
  return (
    <RequirePermission module="products" action="create">
      <PageHeader title="Add product" description="Create a new product in your catalogue." backHref="/admin/products" backLabel="Back to products" />
      <ProductFormLoader />
    </RequirePermission>
  );
}
