"use client";

import { useCallback } from "react";
import { ErrorState } from "@/components/admin/EmptyState";
import { FormSkeleton } from "@/components/admin/LoadingSkeleton";
import { useResource } from "@/hooks/useResource";
import { getAllCategories, getProduct } from "@/lib/api";
import { ProductForm } from "./ProductForm";

/** Loads the categories (and the product when editing) before showing the form. */
export function ProductFormLoader({ productId }: { productId?: string }) {
  const loader = useCallback(async () => {
    const [categories, product] = await Promise.all([getAllCategories(), productId ? getProduct(productId) : Promise.resolve(undefined)]);
    return { categories, product };
  }, [productId]);
  const { data, error, reload } = useResource(loader);

  if (error) return <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6"><FormSkeleton fields={7} /></div>;
  return <ProductForm product={data.product} categories={data.categories} />;
}
