import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductFormLoader } from "../../ProductFormLoader";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="products" action="edit">
      <PageHeader title="Edit product" backHref="/admin/products" backLabel="Back to products" />
      <ProductFormLoader productId={id} />
    </RequirePermission>
  );
}
