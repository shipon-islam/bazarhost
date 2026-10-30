"use client";
import { getRoles } from "@/actions/role";
import {
  bulkDeleteUsers,
  bulkUpdateUserStatus,
  deleteUser,
  getUsers,
  updateUserStatus,
} from "@/actions/users";
import { useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  BulkActionBar,
  FilterSelect,
  FilterToolbar,
} from "@/components/admin/FilterToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Thumb } from "@/components/admin/Thumb";
import {
  Button,
  IconButton,
  IconLink,
  LinkButton,
} from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFetch } from "@/hooks/useFetch";
import { useListQuery } from "@/hooks/useListQuery";
import { useSelection } from "@/hooks/useSelection";
import { CURRENT_USER_ID } from "@/lib/api";
import { reportBulk } from "@/lib/bulk";
import { errorMessage, formatDate, formatDateTime } from "@/lib/utils";
import type { UserStatus, UserWithRole } from "@/types/user";
import {
  Ban,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Pending =
  | { kind: "status"; user: UserWithRole; status: UserStatus }
  | { kind: "delete"; user: UserWithRole }
  | { kind: "bulk-status"; status: UserStatus }
  | { kind: "bulk-delete" }
  | null;

export function UsersView() {
  const can = useCan();
  const toast = useToast();
  const list = useListQuery(getUsers, { sortBy: "createdAt", sortDir: "desc" });
  const roles = useFetch(getRoles);
  const selection = useSelection();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const rows = list.data?.items ?? [];
  const canEdit = can("users", "edit");
  const canDelete = can("users", "delete");

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "status") {
        const u = pending.user;
        await updateUserStatus(u.id, pending.status);
        toast.success(
          pending.status === "active"
            ? "Account reactivated"
            : `Account ${pending.status}`,
          u.name,
        );
      } else if (pending.kind === "delete") {
        await deleteUser(pending.user.id);
        toast.success("User deleted", pending.user.name);
      } else if (pending.kind === "bulk-status") {
        reportBulk(
          toast,
          "user",
          "updated",
          await bulkUpdateUserStatus([...selection.selected], pending.status),
        );
      } else {
        reportBulk(
          toast,
          "user",
          "deleted",
          await bulkDeleteUsers([...selection.selected]),
        );
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
  const columns: Column<UserWithRole>[] = [
    {
      key: "name",
      header: "User",
      sortKey: "name",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Thumb src={u.avatarUrl} name={u.name} rounded="full" />
          <div className="min-w-0">
            <Link
              href={`/admin/users/${u.id}`}
              className="block max-w-56 truncate font-medium text-gray-900 hover:text-brand-700"
            >
              {u.name}
              {u.id === CURRENT_USER_ID && (
                <span className="ml-1.5 text-xs font-normal text-gray-500">
                  (you)
                </span>
              )}
            </Link>
            <p className="max-w-56 truncate text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortKey: "role",
      hideBelow: "sm",
      cell: (u) => u.role?.name,
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      cell: (u) => <StatusBadge kind="user" status={u.status} />,
    },
    {
      key: "registered",
      header: "Registered",
      sortKey: "createdAt",
      hideBelow: "lg",
      cell: (u) => (
        <span className="whitespace-nowrap text-gray-600">
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: "Last login",
      sortKey: "lastLoginAt",
      hideBelow: "xl",
      cell: (u) => (
        <span className="whitespace-nowrap text-gray-600">
          {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (u) => {
        const self = u.id === CURRENT_USER_ID;
        return (
          <div className="flex justify-end gap-0.5">
            <IconLink label={`View ${u.name}`} href={`/admin/users/${u.id}`}>
              <Eye className="h-4 w-4" aria-hidden />
            </IconLink>
            {canEdit && (
              <IconLink
                label={`Edit ${u.name}`}
                href={`/admin/users/${u.id}/edit`}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </IconLink>
            )}
            {canEdit &&
              !self &&
              (u.status === "active" ? (
                <IconButton
                  label={`Disable ${u.name}`}
                  onClick={() =>
                    setPending({ kind: "status", user: u, status: "disabled" })
                  }
                >
                  <Ban className="h-4 w-4" aria-hidden />
                </IconButton>
              ) : (
                <IconButton
                  label={`Reactivate ${u.name}`}
                  onClick={() =>
                    setPending({ kind: "status", user: u, status: "active" })
                  }
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </IconButton>
              ))}
            {canDelete && !self && (
              <IconButton
                label={`Delete ${u.name}`}
                tone="danger"
                onClick={() => setPending({ kind: "delete", user: u })}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </IconButton>
            )}
          </div>
        );
      },
    },
  ];
  const count = selection.selected.size;
  const hasFilters = list.activeFilterCount > 0;

  let title = "";
  let description = "";
  let confirmLabel = "Confirm";
  let tone: "primary" | "danger" = "primary";

  if (pending?.kind === "status") {
    const disabling = pending.status !== "active";
    title = disabling
      ? `Disable ${pending.user.name}?`
      : `Reactivate ${pending.user.name}?`;
    description = disabling
      ? "Disabled users cannot log in. Their data and order history are kept, and you can reactivate the account at any time."
      : "They will be able to log in again straight away.";
    confirmLabel = disabling ? "Disable account" : "Reactivate";
    tone = disabling ? "danger" : "primary";
  } else if (pending?.kind === "delete") {
    title = `Delete ${pending.user.name}?`;
    description =
      "This permanently removes the account. Users with order history can't be deleted: disable them instead.";
    confirmLabel = "Delete user";
    tone = "danger";
  } else if (pending?.kind === "bulk-status") {
    const disabling = pending.status !== "active";
    title = disabling
      ? `Disable ${count} user${count === 1 ? "" : "s"}?`
      : `Reactivate ${count} user${count === 1 ? "" : "s"}?`;
    description = disabling
      ? "Disabled users cannot log in. Your own account will be skipped."
      : "They will be able to log in again.";
    confirmLabel = disabling ? "Disable accounts" : "Reactivate";
    tone = disabling ? "danger" : "primary";
  } else if (pending?.kind === "bulk-delete") {
    title = `Delete ${count} user${count === 1 ? "" : "s"}?`;
    description =
      "Users with order history, and your own account, will be skipped.";
    confirmLabel = "Delete users";
    tone = "danger";
  }

  return (
    <>
      <PageHeader
        title="Customers & Users"
        description="Everyone with an account: customers and staff."
        actions={
          can("users", "create") && (
            <LinkButton href="/admin/users/create">
              <Plus className="h-4 w-4" aria-hidden /> Add user
            </LinkButton>
          )
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <FilterToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search by name, email or phone"
          activeCount={list.activeFilterCount}
          onReset={() => {
            list.resetFilters();
            selection.clear();
          }}
        >
          <FilterSelect
            label="Filter by role"
            allLabel="All roles"
            value={list.filters.role ?? "all"}
            onChange={(v) => list.setFilter("role", v)}
            options={(roles.data?.items ?? []).map((r) => ({
              value: r.id,
              label: r.name,
            }))}
          />
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            value={list.filters.status ?? "all"}
            onChange={(v) => list.setFilter("status", v)}
            options={[
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled" },
              { value: "suspended", label: "Suspended" },
            ]}
          />
        </FilterToolbar>

        <BulkActionBar count={count} onClear={selection.clear}>
          {canEdit && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setPending({ kind: "bulk-status", status: "active" })
                }
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setPending({ kind: "bulk-status", status: "disabled" })
                }
              >
                Disable
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger-outline"
              onClick={() => setPending({ kind: "bulk-delete" })}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </Button>
          )}
        </BulkActionBar>

        <DataTable
          label="Users"
          columns={columns}
          rows={rows}
          rowKey={(u) => u.id}
          loading={list.initialLoading}
          refreshing={list.refreshing}
          error={list.error}
          onRetry={list.reload}
          sort={list.sort}
          onSort={list.toggleSort}
          selection={
            canEdit || canDelete
              ? {
                  selected: selection.selected,
                  onToggle: selection.toggle,
                  onToggleMany: selection.setMany,
                }
              : undefined
          }
          empty={
            <EmptyState
              icon={Users}
              title={
                hasFilters ? "No users match your filters" : "No users yet"
              }
              description={
                hasFilters
                  ? "Try a different search term or clear the filters."
                  : "Invite a user to get started."
              }
              action={
                hasFilters ? (
                  <Button variant="secondary" onClick={list.resetFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          }
        />

        {list.data && list.data.meta.total > 0 && (
          <Pagination
            page={list.page}
            pageSize={list.pageSize}
            total={list.data.meta.total}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
          />
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        loading={busy}
        tone={tone}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
