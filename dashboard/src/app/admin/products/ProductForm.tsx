"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { ApiError, createProduct, updateProduct } from "@/lib/api";
import { errorMessage, slugify } from "@/lib/utils";
import { productSchema, type ProductFormValues } from "@/validations/product";
import type { CategoryWithCount } from "@/types/category";
import type { Product } from "@/types/product";

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  price: 0,
  salePrice: null,
  stock: 0,
  stockStatus: "in_stock",
  status: "draft",
  featured: false,
  seoTitle: "",
  seoDescription: "",
  images: [],
};

function toFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription,
    description: p.description,
    categoryId: p.categoryId,
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    stockStatus: p.stockStatus,
    status: p.status,
    featured: p.featured,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    images: p.images,
  };
}

/**
 * Create / edit form. Pass `product` to edit.
 * MOCK: saving writes to the in-memory mock service (see src/lib/api.ts), not a database.
 */
export function ProductForm({ product, categories }: { product?: Product; categories: CategoryWithCount[] }) {
  const router = useRouter();
  const toast = useToast();
  const editing = Boolean(product);
  // Once the user edits the slug by hand (or when editing an existing product) stop auto-generating it.
  const [slugTouched, setSlugTouched] = useState(editing);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? toFormValues(product) : EMPTY,
  });

  const { navigate, allowNextNavigation, dialog } = useUnsavedChanges(isDirty && !isSubmitSuccessful);

  const name = watch("name");
  const stock = watch("stock");
  const stockStatus = watch("stockStatus");
  const seoTitle = watch("seoTitle");
  const seoDescription = watch("seoDescription");

  // Zero stock is always "out of stock" (the service enforces this too).
  useEffect(() => {
    if (stock === 0 && stockStatus !== "out_of_stock") setValue("stockStatus", "out_of_stock");
  }, [stock, stockStatus, setValue]);

  const nameField = register("name");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const saved = editing && product ? await updateProduct(product.id, values) : await createProduct(values);
      toast.success(editing ? "Product updated" : "Product created", saved.name);
      allowNextNavigation();
      router.push("/admin/products");
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          setError(field as keyof ProductFormValues, { type: "server", message });
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
              <Field label="Product name" htmlFor="name" required error={errors.name?.message}>
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
                hint="Used in the product URL. Generated from the name until you edit it."
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
                <Input
                  id="slug"
                  autoComplete="off"
                  hasHint
                  error={errors.slug?.message}
                  {...register("slug", {
                    onChange: () => {
                      setSlugTouched(true);
                    },
                  })}
                />
              </Field>
              <Field label="SKU" htmlFor="sku" error={errors.sku?.message} hint="Optional. Must be unique." >
                <Input id="sku" autoComplete="off" hasHint error={errors.sku?.message} {...register("sku")} />
              </Field>
              <Field label="Short description" htmlFor="shortDescription" error={errors.shortDescription?.message} hint="Shown in listings. Up to 200 characters.">
                <Textarea id="shortDescription" rows={2} hasHint error={errors.shortDescription?.message} {...register("shortDescription")} />
              </Field>
              <Field label="Full description" htmlFor="description" error={errors.description?.message}>
                <Textarea id="description" rows={7} error={errors.description?.message} {...register("description")} />
              </Field>
            </div>
          </Card>

          <Card title="Images" description="The first image is used as the cover.">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  label="Product images"
                  value={field.value}
                  onChange={(urls) => field.onChange(urls)}
                  error={errors.images?.message}
                />
              )}
            />
          </Card>

          <Card title="Search engine listing" description="Optional. Falls back to the product name and short description.">
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
          <Card title="Status">
            <div className="space-y-5">
              <Field label="Product status" htmlFor="status" error={errors.status?.message}>
                <Select id="status" error={errors.status?.message} {...register("status")}>
                  <option value="active">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p id="featured-label" className="text-sm font-medium text-gray-700">Featured product</p>
                  <p className="text-xs text-gray-500">Highlight on the storefront.</p>
                </div>
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => <Switch id="featured" label="Featured product" checked={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>
          </Card>

          <Card title="Organisation">
            <Field label="Category" htmlFor="categoryId" required error={errors.categoryId?.message}>
              <Select id="categoryId" error={errors.categoryId?.message} {...register("categoryId")}>
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>

          <Card title="Pricing">
            <div className="space-y-5">
              <Field label="Regular price (৳)" htmlFor="price" required error={errors.price?.message}>
                <Input id="price" type="number" inputMode="decimal" min={0} step="0.01" error={errors.price?.message} {...register("price", { valueAsNumber: true })} />
              </Field>
              <Field label="Sale price (৳)" htmlFor="salePrice" error={errors.salePrice?.message} hint="Optional. Must be lower than the regular price.">
                <Input
                  id="salePrice"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  hasHint
                  error={errors.salePrice?.message}
                  {...register("salePrice", { setValueAs: (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v)) })}
                />
              </Field>
            </div>
          </Card>

          <Card title="Inventory">
            <div className="space-y-5">
              <Field label="Stock quantity" htmlFor="stock" required error={errors.stock?.message}>
                <Input id="stock" type="number" inputMode="numeric" min={0} step={1} error={errors.stock?.message} {...register("stock", { valueAsNumber: true })} />
              </Field>
              <Field label="Stock status" htmlFor="stockStatus" error={errors.stockStatus?.message} hint={stock === 0 ? "Products with zero stock are always out of stock." : undefined}>
                <Select id="stockStatus" hasHint={stock === 0} error={errors.stockStatus?.message} {...register("stockStatus")}>
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </Select>
              </Field>
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {isDirty && <p className="mr-auto text-sm text-amber-800">You have unsaved changes.</p>}
        <Button variant="secondary" onClick={() => navigate("/admin/products")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? "Save changes" : "Create product"}
        </Button>
      </div>
      {dialog}
    </form>
  );
}
