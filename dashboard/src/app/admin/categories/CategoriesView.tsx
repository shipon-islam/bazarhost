"use client";

import { useCallback, useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useListQuery } from "@/hooks/useListQuery";
import { useResource } from "@/hooks/useResource";
import { useSelection } from "@/hooks/useSelection";
import {
  bulkDeleteCategories,
  bulkUpdateCategoryStatus,
  deleteCategory,
  getAllCategories,
  getCategories,
} from "@/lib/api";
import { reportBulk } from "@/lib/bulk";
import { errorMessage, formatDate } from "@/lib/utils";
import type { CategoryStatus, CategoryWithCount } from "@/types/category";

type Pending =
  | { kind: "delete"; category: CategoryWithCount }
  | { kind: "blocked"; category: CategoryWithCount; reason: string }
  | { kind: "bulk-delete" }
  | { kind: "bulk-status"; status: CategoryStatus }
  | null;

export function CategoriesView() {
  const can = useCan();
  const toast = useToast();
  const list = useListQuery(getCategories, { sortBy: "name", sortDir: "asc" });
  const selection = useSelection();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  // Used only to know which categories have sub-categories (delete is blocked for those).
  const allLoader = useCallback(() => getAllCategories(), []);
  const { data: all, reload: reloadAll } = useResource(allLoader);

  const rows = list.data?.items ?? [];
  const canEdit = can("categories", "edit");
  const canDelete = can("categories", "delete");

  const requestDelete = (c: CategoryWithCount) => {
    const children = all?.filter((x) => x.parentId === c.id).length ?? 0;
    if (c.productCount > 0) {
      setPending({
        kind: "blocked",
        category: c,
        reason: `“${c.name}” still contains ${c.productCount} product${c.productCount === 1 ? "" : "s"}. Move them to another category first (products are never deleted automatically), or set the category to Hidden instead.`,
      });
    } else if (children > 0) {
      setPending({
        kind: "blocked",
        category: c,
        reason: `“${c.name}” has ${children} sub-categor${children === 1 ? "y" : "ies"}. Delete or move ${children === 1 ? "it" : "them"} first.`,
      });
    } else {
      setPending({ kind: "delete", category: c });
    }
  };

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "delete") {
        await deleteCategory(pending.category.id);
        toast.success("Category deleted", pending.category.name);
      } else if (pending.kind === "bulk-delete") {
        reportBulk(toast, "category", "deleted", await bulkDeleteCategories([...selection.selected]));
      } else if (pending.kind === "bulk-status") {
        reportBulk(toast, "category", "updated", await bulkUpdateCategoryStatus([...selection.selected], pending.status));
      }
      selection.clear();
      setPending(null);
      list.reload();
      reloadAll();
    } catch (e) {
      toast.error("Action failed", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<CategoryWithCount>[] = [
    {
      key: "name",
      header: "Category",
      sortKey: "name",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Thumb src={c.image} emoji={c.emoji} name={c.name} />
          <div className="min-w-0">
            <p className="max-w-64 truncate font-medium text-gray-900">{c.name}</p>
            {c.parentName && <p className="text-xs text-gray-500">in {c.parentName}</p>}
          </div>
        </div>
      ),
    },
    { key: "slug", header: "Slug", sortKey: "slug", hideBelow: "md", cell: (c) => <span className="font-mono text-xs text-gray-600">{c.slug}</span> },
    { key: "products", header: "Products", sortKey: "productCount", align: "right", cell: (c) => c.productCount },
    { key: "status", header: "Status", sortKey: "status", cell: (c) => <StatusBadge kind="category" status={c.status} /> },
    { key: "created", header: "Created", sortKey: "createdAt", hideBelow: "lg", cell: (c) => <span className="whitespace-nowrap text-gray-600">{formatDate(c.createdAt)}</span> },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (c) => (
        <div className="flex justify-end gap-0.5">
          {canEdit && (
            <IconLink label={`Edit ${c.name}`} href={`/admin/categories/${c.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconLink>
          )}
          {canDelete && (
            <IconButton label={`Delete ${c.name}`} tone="danger" onClick={() => requestDelete(c)}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  const count = selection.selected.size;
  const hasFilters = list.activeFilterCount > 0;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise products into categories and sub-categories."
        actions={
          can("categories", "create") && (
            <LinkButton href="/admin/categories/create">
              <Plus className="h-4 w-4" aria-hidden /> Add category
            </LinkButton>
          )
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <FilterToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search categories"
          activeCount={list.activeFilterCount}
          onReset={() => {
            list.resetFilters();
            selection.clear();
          }}
        >
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            value={list.filters.status ?? "all"}
            onChange={(v) => list.setFilter("status", v)}
            options={[
              { value: "active", label: "Active" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
        </FilterToolbar>

        <BulkActionBar count={count} onClear={selection.clear}>
          {canEdit && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setPending({ kind: "bulk-status", status: "active" })}>
                Set active
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPending({ kind: "bulk-status", status: "hidden" })}>
                Hide
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
          label="Categories"
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
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
                icon={FolderTree}
                title="No categories match your filters"
                description="Try a different search term or clear the filters."
                action={<Button variant="secondary" onClick={list.resetFilters}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                icon={FolderTree}
                title="No categories yet"
                description="Create a category to start organising your products."
                action={can("categories", "create") ? <LinkButton href="/admin/categories/create">Add category</LinkButton> : undefined}
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
        open={pending?.kind === "delete" || pending?.kind === "bulk-delete" || pending?.kind === "bulk-status"}
        loading={busy}
        tone={pending?.kind === "bulk-status" ? "primary" : "danger"}
        title={
          pending?.kind === "delete"
            ? "Delete this category?"
            : pending?.kind === "bulk-delete"
              ? `Delete ${count} categor${count === 1 ? "y" : "ies"}?`
              : `Set ${count} categor${count === 1 ? "y" : "ies"} to ${pending?.kind === "bulk-status" ? pending.status : ""}?`
        }
        description={
          pending?.kind === "delete"
            ? `“${pending.category.name}” is empty and will be permanently removed.`
            : pending?.kind === "bulk-delete"
              ? "Categories that still contain products or have sub-categories will be skipped. Products are never deleted."
              : "You can change the status again at any time."
        }
        confirmLabel={pending?.kind === "bulk-status" ? "Update status" : "Delete"}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />

      <Modal
        open={pending?.kind === "blocked"}
        onClose={() => setPending(null)}
        title="This category can't be deleted"
        description={pending?.kind === "blocked" ? pending.reason : undefined}
        size="sm"
        footer={<Button variant="secondary" onClick={() => setPending(null)}>Got it</Button>}
      />
    </>
  );
}
