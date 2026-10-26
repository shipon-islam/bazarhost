"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, PackageSearch, Pencil, Plus, Trash2 } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { BulkActionBar, FilterSelect, FilterToolbar } from "@/components/admin/FilterToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Thumb } from "@/components/admin/Thumb";
import { Button, IconButton, IconLink, LinkButton } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useListQuery } from "@/hooks/useListQuery";
import { useSelection } from "@/hooks/useSelection";
import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  deleteProduct,
  getAllCategories,
  getProducts,
} from "@/lib/api";
import { reportBulk } from "@/lib/bulk";
import { errorMessage, formatCurrency, formatDate } from "@/lib/utils";
import type { CategoryWithCount } from "@/types/category";
import { LOW_STOCK_THRESHOLD, type ProductRow, type ProductStatus } from "@/types/product";

type Pending =
  | { kind: "delete"; product: ProductRow }
  | { kind: "bulk-delete" }
  | { kind: "bulk-status"; status: ProductStatus }
  | null;

export function ProductsView({ initialSearch = "" }: { initialSearch?: string }) {
  const can = useCan();
  const toast = useToast();
  const list = useListQuery(getProducts, { search: initialSearch, sortBy: "createdAt", sortDir: "desc" });
  const selection = useSelection();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllCategories()
      .then((c) => {
        if (!cancelled) setCategories(c);
      })
      .catch(() => {
        /* the category filter simply stays empty; the table still works */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = list.data?.items ?? [];
  const canEdit = can("products", "edit");
  const canDelete = can("products", "delete");

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "delete") {
        await deleteProduct(pending.product.id);
        toast.success("Product deleted", pending.product.name);
      } else if (pending.kind === "bulk-delete") {
        reportBulk(toast, "product", "deleted", await bulkDeleteProducts([...selection.selected]));
      } else {
        reportBulk(toast, "product", "updated", await bulkUpdateProductStatus([...selection.selected], pending.status));
      }
      selection.clear();
      setPending(null);
      list.reload();
    } catch (e) {
      toast.error("Action failed", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      sortKey: "name",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <Thumb src={p.images[0]} emoji={p.emoji} name={p.name} />
          <div className="min-w-0">
            <Link href={`/admin/products/${p.id}`} className="block max-w-64 truncate font-medium text-gray-900 hover:text-brand-700">
              {p.name}
            </Link>
            {p.featured && <span className="text-xs font-medium text-brand-700">Featured</span>}
          </div>
        </div>
      ),
    },
    { key: "sku", header: "SKU", sortKey: "sku", hideBelow: "lg", cell: (p) => <span className="font-mono text-xs text-gray-600">{p.sku || "—"}</span> },
    { key: "category", header: "Category", sortKey: "category", hideBelow: "md", cell: (p) => p.categoryName },
    {
      key: "price",
      header: "Price",
      sortKey: "price",
      align: "right",
      cell: (p) =>
        p.salePrice !== null ? (
          <div>
            <span className="font-medium text-gray-900">{formatCurrency(p.salePrice)}</span>
            <span className="ml-1.5 text-xs text-gray-500 line-through">{formatCurrency(p.price)}</span>
          </div>
        ) : (
          <span className="font-medium text-gray-900">{formatCurrency(p.price)}</span>
        ),
    },
    {
      key: "stock",
      header: "Stock",
      sortKey: "stock",
      align: "right",
      cell: (p) => (
        <div className="flex flex-col items-end gap-1">
          <span className="font-medium text-gray-900">{p.stock}</span>
          {p.stock === 0 || p.stockStatus === "out_of_stock" ? (
            <StatusBadge kind="stock" status="out_of_stock" />
          ) : p.stock <= LOW_STOCK_THRESHOLD ? (
            <StatusBadge kind="stock" status="low" />
          ) : null}
        </div>
      ),
    },
    { key: "status", header: "Status", sortKey: "status", cell: (p) => <StatusBadge kind="product" status={p.status} /> },
    { key: "created", header: "Created", sortKey: "createdAt", hideBelow: "xl", cell: (p) => <span className="whitespace-nowrap text-gray-600">{formatDate(p.createdAt)}</span> },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-0.5">
          <IconLink label={`View ${p.name}`} href={`/admin/products/${p.id}`}>
            <Eye className="h-4 w-4" aria-hidden />
          </IconLink>
          {canEdit && (
            <IconLink label={`Edit ${p.name}`} href={`/admin/products/${p.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconLink>
          )}
          {canDelete && (
            <IconButton label={`Delete ${p.name}`} tone="danger" onClick={() => setPending({ kind: "delete", product: p })}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  const hasFilters = list.activeFilterCount > 0;
  const count = selection.selected.size;

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your catalogue, pricing and stock."
        actions={
          can("products", "create") && (
            <LinkButton href="/admin/products/create">
              <Plus className="h-4 w-4" aria-hidden /> Add product
            </LinkButton>
          )
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <FilterToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search by name or SKU"
          activeCount={list.activeFilterCount}
          onReset={() => {
            list.resetFilters();
            selection.clear();
          }}
        >
          <FilterSelect
            label="Filter by category"
            allLabel="All categories"
            value={list.filters.categoryId ?? "all"}
            onChange={(v) => list.setFilter("categoryId", v)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FilterSelect
            label="Filter by stock"
            allLabel="Any stock"
            value={list.filters.stock ?? "all"}
            onChange={(v) => list.setFilter("stock", v)}
            options={[
              { value: "in_stock", label: "In stock" },
              { value: "low", label: "Low stock" },
              { value: "out_of_stock", label: "Out of stock" },
            ]}
          />
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            value={list.filters.status ?? "all"}
            onChange={(v) => list.setFilter("status", v)}
            options={[
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </FilterToolbar>

        <BulkActionBar count={count} onClear={selection.clear}>
          {canEdit && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setPending({ kind: "bulk-status", status: "active" })}>
                Set active
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPending({ kind: "bulk-status", status: "draft" })}>
                Set draft
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPending({ kind: "bulk-status", status: "archived" })}>
                Archive
              </Button>
            </>
          )}
          {canDelete && (
            <Button size="sm" variant="danger-outline" onClick={() => setPending({ kind: "bulk-delete" })}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </Button>
          )}
        </BulkActionBar>

        <DataTable
          label="Products"
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          loading={list.initialLoading}
          refreshing={list.refreshing}
          error={list.error}
          onRetry={list.reload}
          sort={list.sort}
          onSort={list.toggleSort}
          selection={canEdit || canDelete ? { selected: selection.selected, onToggle: selection.toggle, onToggleMany: selection.setMany } : undefined}
          empty={
            hasFilters ? (
              <EmptyState
                icon={PackageSearch}
                title="No products match your filters"
                description="Try a different search term or clear the filters."
                action={
                  <Button variant="secondary" onClick={list.resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No products yet"
                description="Add your first product to start selling."
                action={can("products", "create") ? <LinkButton href="/admin/products/create">Add product</LinkButton> : undefined}
              />
            )
          }
        />

        {list.data && list.data.total > 0 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.data.total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        loading={busy}
        tone={pending?.kind === "bulk-status" ? "primary" : "danger"}
        title={
          pending?.kind === "delete"
            ? "Delete this product?"
            : pending?.kind === "bulk-delete"
              ? `Delete ${count} product${count === 1 ? "" : "s"}?`
              : `Set ${count} product${count === 1 ? "" : "s"} to ${pending?.kind === "bulk-status" ? pending.status : ""}?`
        }
        description={
          pending?.kind === "delete"
            ? `“${pending.product.name}” will be permanently removed. Past orders keep their own copy of the item details.`
            : pending?.kind === "bulk-delete"
              ? "The selected products will be permanently removed. This can't be undone."
              : "You can change the status again at any time."
        }
        confirmLabel={pending?.kind === "bulk-status" ? "Update status" : "Delete"}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
