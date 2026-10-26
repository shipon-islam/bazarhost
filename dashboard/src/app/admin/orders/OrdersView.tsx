"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Eye, ShoppingCart } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { BulkActionBar, FilterSelect, FilterToolbar } from "@/components/admin/FilterToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { PAYMENT_METHOD_LABELS, StatusBadge } from "@/components/admin/StatusBadge";
import { Button, IconLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useListQuery } from "@/hooks/useListQuery";
import { useSelection } from "@/hooks/useSelection";
import { bulkUpdateOrderStatus, exportOrders, getOrders } from "@/lib/api";
import { reportBulk } from "@/lib/bulk";
import { downloadCsv, errorMessage, formatCurrency, formatDate, titleCase } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

const DATE_INPUT =
  "h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-sm text-gray-900 shadow-sm hover:border-gray-400 focus:border-brand-500";

export function OrdersView() {
  const can = useCan();
  const toast = useToast();
  const list = useListQuery(getOrders, { sortBy: "createdAt", sortDir: "desc" });
  const selection = useSelection();
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const rows = list.data?.items ?? [];
  const canEdit = can("orders", "edit");
  const from = list.filters.from ?? "";
  const to = list.filters.to ?? "";
  const invalidRange = from !== "" && to !== "" && from > to;

  const confirmBulk = async () => {
    if (!bulkStatus) return;
    setBusy(true);
    try {
      reportBulk(toast, "order", "updated", await bulkUpdateOrderStatus([...selection.selected], bulkStatus));
      selection.clear();
      setBulkStatus(null);
      list.reload();
    } catch (e) {
      toast.error("Couldn't update orders", errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      // Exports every order matching the current search/filters, not just this page.
      const orders = await exportOrders(list.query);
      downloadCsv("orders.csv", [
        ["Order", "Date", "Customer", "Email", "Items", "Subtotal", "Discount", "Shipping", "Tax", "Total", "Payment method", "Payment status", "Status"],
        ...orders.map((o) => [
          o.number,
          formatDate(o.createdAt),
          o.customerName,
          o.customerEmail,
          o.itemCount,
          o.subtotal,
          o.discount,
          o.shipping,
          o.tax,
          o.total,
          PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod,
          titleCase(o.paymentStatus),
          titleCase(o.status),
        ]),
      ]);
      toast.success("Export ready", `${orders.length} order${orders.length === 1 ? "" : "s"} exported (mock data).`);
    } catch (e) {
      toast.error("Export failed", errorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "number",
      header: "Order",
      sortKey: "number",
      cell: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-medium text-gray-900 hover:text-brand-700">
          {o.number}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortKey: "customer",
      cell: (o) => (
        <div className="min-w-0">
          <p className="max-w-48 truncate font-medium text-gray-900">{o.customerName}</p>
          <p className="max-w-48 truncate text-xs text-gray-500">{o.customerEmail}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", sortKey: "createdAt", hideBelow: "md", cell: (o) => <span className="whitespace-nowrap text-gray-600">{formatDate(o.createdAt)}</span> },
    { key: "items", header: "Items", sortKey: "items", align: "right", hideBelow: "lg", cell: (o) => o.itemCount },
    { key: "total", header: "Total", sortKey: "total", align: "right", cell: (o) => <span className="font-medium text-gray-900">{formatCurrency(o.total)}</span> },
    { key: "method", header: "Payment method", hideBelow: "xl", cell: (o) => PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod },
    { key: "payment", header: "Payment", sortKey: "payment", hideBelow: "sm", cell: (o) => <StatusBadge kind="payment" status={o.paymentStatus} /> },
    { key: "status", header: "Status", sortKey: "status", cell: (o) => <StatusBadge kind="order" status={o.status} /> },
    {
      key: "actions",
      header: "Actions",
      srOnlyHeader: true,
      align: "right",
      cell: (o) => (
        <IconLink label={`View order ${o.number}`} href={`/admin/orders/${o.id}`}>
          <Eye className="h-4 w-4" aria-hidden />
        </IconLink>
      ),
    },
  ];

  const hasFilters = list.activeFilterCount > 0;
  const count = selection.selected.size;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track and fulfil customer orders."
        actions={
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <FilterToolbar
          search={list.search}
          onSearch={list.setSearch}
          searchPlaceholder="Search order, name or email"
          activeCount={list.activeFilterCount}
          onReset={() => {
            list.resetFilters();
            selection.clear();
          }}
        >
          <FilterSelect
            label="Filter by order status"
            allLabel="All statuses"
            value={list.filters.status ?? "all"}
            onChange={(v) => list.setFilter("status", v)}
            options={(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => ({ value: s, label: titleCase(s) }))}
          />
          <FilterSelect
            label="Filter by payment status"
            allLabel="Any payment"
            value={list.filters.payment ?? "all"}
            onChange={(v) => list.setFilter("payment", v)}
            options={(["paid", "pending", "failed", "refunded"] as const).map((s) => ({ value: s, label: titleCase(s) }))}
          />
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="order-from">From date</label>
            <input id="order-from" type="date" value={from} max={to || undefined} onChange={(e) => list.setFilter("from", e.target.value)} className={DATE_INPUT} />
            <span className="text-sm text-gray-500" aria-hidden>–</span>
            <label className="sr-only" htmlFor="order-to">To date</label>
            <input id="order-to" type="date" value={to} min={from || undefined} onChange={(e) => list.setFilter("to", e.target.value)} className={DATE_INPUT} />
          </div>
        </FilterToolbar>
        {invalidRange && (
          <p role="alert" className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            The start date is after the end date, so no orders can match.
          </p>
        )}

        <BulkActionBar count={count} onClear={selection.clear}>
          {(["processing", "shipped", "delivered"] as const).map((s) => (
            <Button key={s} size="sm" variant="secondary" onClick={() => setBulkStatus(s)}>
              Mark {s}
            </Button>
          ))}
          <Button size="sm" variant="danger-outline" onClick={() => setBulkStatus("cancelled")}>
            Cancel orders
          </Button>
        </BulkActionBar>

        <DataTable
          label="Orders"
          columns={columns}
          rows={rows}
          rowKey={(o) => o.id}
          loading={list.initialLoading}
          refreshing={list.refreshing}
          error={list.error}
          onRetry={list.reload}
          sort={list.sort}
          onSort={list.toggleSort}
          selection={canEdit ? { selected: selection.selected, onToggle: selection.toggle, onToggleMany: selection.setMany } : undefined}
          empty={
            <EmptyState
              icon={ShoppingCart}
              title={hasFilters ? "No orders match your filters" : "No orders yet"}
              description={hasFilters ? "Try a different search term, status or date range." : "Orders will appear here as customers check out."}
              action={hasFilters ? <Button variant="secondary" onClick={list.resetFilters}>Clear filters</Button> : undefined}
            />
          }
        />

        {list.data && list.data.total > 0 && (
          <Pagination page={list.page} pageSize={list.pageSize} total={list.data.total} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
        )}
      </div>

      <ConfirmDialog
        open={bulkStatus !== null}
        loading={busy}
        tone={bulkStatus === "cancelled" ? "danger" : "primary"}
        title={bulkStatus === "cancelled" ? `Cancel ${count} order${count === 1 ? "" : "s"}?` : `Mark ${count} order${count === 1 ? "" : "s"} as ${bulkStatus ?? ""}?`}
        description={
          bulkStatus === "cancelled"
            ? "Cancelled orders can't be reopened. Orders that are already shipped or delivered will be skipped."
            : "Orders that can't move to this status from their current one will be skipped."
        }
        confirmLabel={bulkStatus === "cancelled" ? "Cancel orders" : "Update orders"}
        cancelLabel="Go back"
        onConfirm={confirmBulk}
        onCancel={() => setBulkStatus(null)}
      />
    </>
  );
}
