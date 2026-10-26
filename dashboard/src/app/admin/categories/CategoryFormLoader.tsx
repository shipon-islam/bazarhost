"use client";

import { useCallback } from "react";
import { ErrorState } from "@/components/admin/EmptyState";
import { FormSkeleton } from "@/components/admin/LoadingSkeleton";
import { useResource } from "@/hooks/useResource";
import { getAllCategories } from "@/lib/api";
import { CategoryForm } from "./CategoryForm";

/** Loads all categories (for the parent picker) before showing the form; the category being edited is looked up from them. */
export function CategoryFormLoader({ categoryId }: { categoryId?: string }) {
  const loader = useCallback(() => getAllCategories(), []);
  const { data, error, reload } = useResource(loader);

  if (error) return <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6"><FormSkeleton fields={5} /></div>;

  const category = categoryId ? data.find((c) => c.id === categoryId) : undefined;
  if (categoryId && !category) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <ErrorState title="Category not found" message="It may have been deleted." />
      </div>
    );
  }
  return <CategoryForm category={category} categories={data} />;
}
