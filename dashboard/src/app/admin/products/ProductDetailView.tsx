"use client";

import Image from "next/image";
import { useCallback } from "react";
import { Pencil } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { ErrorState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Thumb } from "@/components/admin/Thumb";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/form";
import { useResource } from "@/hooks/useResource";
import { getAllCategories, getProduct } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-gray-600">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{children}</dd>
    </div>
  );
}

export function ProductDetailView({ productId }: { productId: string }) {
  const can = useCan();
  const loader = useCallback(async () => {
    const [product, categories] = await Promise.all([getProduct(productId), getAllCategories()]);
    return { product, categoryName: categories.find((c) => c.id === product.categoryId)?.name ?? "Uncategorised" };
  }, [productId]);
  const { data, error, reload } = useResource(loader);

  if (error) {
    return (
      <>
        <PageHeader title="Product" backHref="/admin/products" backLabel="Back to products" />
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <PageHeader title="Product" backHref="/admin/products" backLabel="Back to products" />
        <div className="grid gap-6 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }

  const { product: p, categoryName } = data;
  return (
    <>
      <PageHeader
        title={p.name}
        backHref="/admin/products"
        backLabel="Back to products"
        meta={<StatusBadge kind="product" status={p.status} />}
        description={p.sku ? `SKU ${p.sku}` : undefined}
        actions={
          can("products", "edit") && (
            <LinkButton href={`/admin/products/${p.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden /> Edit product
            </LinkButton>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Images">
            {p.images.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.images.map((src, i) => (
                  <li key={src} className="overflow-hidden rounded-xl border border-gray-200">
                    <Image src={src} alt={`${p.name} image ${i + 1}`} width={200} height={200} unoptimized className="aspect-square h-auto w-full object-cover" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Thumb emoji={p.emoji} name={p.name} size={56} />
                No images uploaded for this product.
              </div>
            )}
          </Card>
          <Card title="Description">
            {p.shortDescription && <p className="mb-3 font-medium text-gray-900">{p.shortDescription}</p>}
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{p.description || "No description."}</p>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Details">
            <dl className="divide-y divide-gray-100">
              <Row label="Category">{categoryName}</Row>
              <Row label="Price">{formatCurrency(p.price)}</Row>
              <Row label="Sale price">{p.salePrice !== null ? formatCurrency(p.salePrice) : "—"}</Row>
              <Row label="Stock">{p.stock}</Row>
              <Row label="Stock status"><StatusBadge kind="stock" status={p.stockStatus} /></Row>
              <Row label="Featured">{p.featured ? "Yes" : "No"}</Row>
              <Row label="Slug"><span className="font-mono text-xs">{p.slug}</span></Row>
              <Row label="Created">{formatDateTime(p.createdAt)}</Row>
            </dl>
          </Card>
          <Card title="Search listing">
            <p className="text-sm font-medium text-gray-900">{p.seoTitle || p.name}</p>
            <p className="mt-1 text-sm text-gray-600">{p.seoDescription || p.shortDescription || "—"}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
