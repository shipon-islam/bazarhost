import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { ProductDetailView } from "../ProductDetailView";

export const metadata: Metadata = { title: "Product" };

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequirePermission module="products">
      <ProductDetailView productId={id} />
    </RequirePermission>
  );
}
