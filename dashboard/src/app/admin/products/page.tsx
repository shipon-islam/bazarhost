import type { Metadata } from "next";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { ProductsView } from "./ProductsView";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  // The top-bar search sends people here as /admin/products?q=term
  const { q } = await searchParams;
  const initialSearch = (Array.isArray(q) ? q[0] : q) ?? "";
  return (
    <RequirePermission module="products">
      {/* key: a new ?q= while already on this page remounts the view with the new term */}
      <ProductsView key={initialSearch} initialSearch={initialSearch} />
    </RequirePermission>
  );
}
