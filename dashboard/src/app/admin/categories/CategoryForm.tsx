"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ApiError, categoryDescendantIds, createCategory, updateCategory } from "@/lib/api";
import { errorMessage, slugify } from "@/lib/utils";
import { categorySchema, type CategoryFormValues } from "@/validations/category";
import type { Category, CategoryInput, CategoryWithCount } from "@/types/category";

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: null,
  parentId: "",
  status: "active",
  seoTitle: "",
  seoDescription: "",
};

function toFormValues(c: Category): CategoryFormValues {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentId: c.parentId ?? "",
    status: c.status,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
  };
}

/** MOCK: saving writes to the in-memory mock service, not a database. */
export function CategoryForm({ category, categories }: { category?: Category; categories: CategoryWithCount[] }) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(category);
  const [slugTouched, setSlugTouched] = useState(editing);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // A category can't be its own parent, nor sit under one of its own descendants (that would create a loop).
  const blocked = new Set<string>(category ? [category.id, ...categoryDescendantIds(categories, category.id)] : []);
  const parentOptions = categories.filter((c) => !blocked.has(c.id));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? toFormValues(category) : EMPTY,
  });

  const { navigate, allowNextNavigation, dialog } = useUnsavedChanges(isDirty && !isSubmitSuccessful);
  const name = watch("name");
  const seoTitle = watch("seoTitle");
  const seoDescription = watch("seoDescription");
  const nameField = register("name");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const input: CategoryInput = { ...values, parentId: values.parentId === "" ? null : values.parentId };
    try {
      const saved = editing && category ? await updateCategory(category.id, input) : await createCategory(input);
      toast.success(editing ? "Category updated" : "Category created", saved.name);
      allowNextNavigation();
      router.push("/admin/categories");
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          setError(field as keyof CategoryFormValues, { type: "server", message });
        }
      }
      setSubmitError(errorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {submitError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Basic information">
            <div className="space-y-5">
              <Field label="Category name" htmlFor="name" required error={errors.name?.message}>
                <Input
                  id="name"
                  autoComplete="off"
                  error={errors.name?.message}
                  {...nameField}
                  onChange={(e) => {
                    void nameField.onChange(e);
                    if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldDirty: true, shouldValidate: true });
                  }}
                />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                required
                error={errors.slug?.message}
                hint="Used in the category URL. Generated from the name until you edit it."
                action={
                  slugTouched ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                      onClick={() => {
                        setSlugTouched(false);
                        setValue("slug", slugify(name), { shouldDirty: true, shouldValidate: true });
                      }}
                    >
                      <RefreshCw className="h-3 w-3" aria-hidden /> Regenerate
                    </button>
                  ) : undefined
                }
              >
                <Input id="slug" autoComplete="off" hasHint error={errors.slug?.message} {...register("slug", { onChange: () => setSlugTouched(true) })} />
              </Field>
              <Field label="Description" htmlFor="description" error={errors.description?.message}>
                <Textarea id="description" rows={4} error={errors.description?.message} {...register("description")} />
              </Field>
            </div>
          </Card>

          <Card title="Image" description="Optional thumbnail shown in the storefront.">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploader
                  label="Category image"
                  max={1}
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? null)}
                  error={errors.image?.message}
                />
              )}
            />
          </Card>

          <Card title="Search engine listing" description="Optional.">
            <div className="space-y-5">
              <Field label="SEO title" htmlFor="seoTitle" error={errors.seoTitle?.message} hint={`${seoTitle?.length ?? 0}/70 characters`}>
                <Input id="seoTitle" hasHint error={errors.seoTitle?.message} {...register("seoTitle")} />
              </Field>
              <Field label="SEO description" htmlFor="seoDescription" error={errors.seoDescription?.message} hint={`${seoDescription?.length ?? 0}/160 characters`}>
                <Textarea id="seoDescription" rows={3} hasHint error={errors.seoDescription?.message} {...register("seoDescription")} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibility">
            <Field label="Status" htmlFor="status" error={errors.status?.message} hint="Hidden categories aren't shown on the storefront.">
              <Select id="status" hasHint error={errors.status?.message} {...register("status")}>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </Select>
            </Field>
          </Card>
          <Card title="Hierarchy">
            <Field
              label="Parent category"
              htmlFor="parentId"
              error={errors.parentId?.message}
              hint={editing ? "This category and its sub-categories are excluded to prevent loops." : undefined}
            >
              <Select id="parentId" hasHint={editing} error={errors.parentId?.message} {...register("parentId")}>
                <option value="">None (top level)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {isDirty && <p className="mr-auto text-sm text-amber-800">You have unsaved changes.</p>}
        <Button variant="secondary" onClick={() => navigate("/admin/categories")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? "Save changes" : "Create category"}
        </Button>
      </div>
      {dialog}
    </form>
  );
}
