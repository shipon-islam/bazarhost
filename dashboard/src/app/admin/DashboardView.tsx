"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AlertTriangle, CircleDollarSign, Package, Plus, ShoppingCart, Timer, Users, FolderPlus } from "lucide-react";
import { useCan } from "@/components/admin/AuthContext";
import { DateRangeSelect } from "@/components/admin/DateRangeSelect";
import { EmptyState, ErrorState } from "@/components/admin/EmptyState";
import { CardListSkeleton, Skeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Thumb } from "@/components/admin/Thumb";
import {
  OrdersChart,
  RevenueChart,
  StatusDonut,
  TopProductsChart,
} from "@/components/charts/lazy";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/form";
import { useResource } from "@/hooks/useResource";
import { getDashboard } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type { RangeKey } from "@/types/common";

const RANGES: RangeKey[] = ["today", "7d", "30d", "90d"];

const PERIOD_LABEL: Record<RangeKey, string> = {
  today: "vs yesterday",
  "7d": "vs previous 7 days",
  "30d": "vs previous 30 days",
  "90d": "vs previous 90 days",
  "365d": "vs previous 12 months",
};

export function DashboardView() {
  const can = useCan();
  const [range, setRange] = useState<RangeKey>("30d");
  const loader = useCallback(() => getDashboard(range), [range]);
  const { data, error, loading, reload } = useResource(loader);

  // While a new range loads we keep the old data on screen but dim it.
  const stale = data !== null && data.range !== range;
  const label = PERIOD_LABEL[range];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of store performance. Figures are mock data for demonstration."
        actions={
          <>
            {can("categories", "create") && (
              <LinkButton href="/admin/categories/create" variant="secondary">
                <FolderPlus className="h-4 w-4" aria-hidden /> Add category
              </LinkButton>
            )}
            {can("products", "create") && (
              <LinkButton href="/admin/products/create">
                <Plus className="h-4 w-4" aria-hidden /> Add product
              </LinkButton>
            )}
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-700">Overview</h2>
        <DateRangeSelect value={range} onChange={setRange} options={RANGES} />
      </div>

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : (
        <div className={stale ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={loading || stale}>
          <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total revenue"
              icon={CircleDollarSign}
              iconTone="green"
              loading={!data}
              value={data ? formatCurrency(data.stats.revenue.value) : ""}
              change={data?.stats.revenue.change}
              changeLabel={label}
            />
            <StatCard
              label="Total orders"
              icon={ShoppingCart}
              iconTone="blue"
              loading={!data}
              value={data ? formatNumber(data.stats.orders.value) : ""}
              change={data?.stats.orders.change}
              changeLabel={label}
            />
            <StatCard
              label="Total products"
              icon={Package}
              iconTone="indigo"
              loading={!data}
              value={data ? formatNumber(data.stats.products.value) : ""}
              change={data?.stats.products.change}
              changeLabel={label}
            />
            <StatCard
              label="Total customers"
              icon={Users}
              iconTone="purple"
              loading={!data}
              value={data ? formatNumber(data.stats.customers.value) : ""}
              change={data?.stats.customers.change}
              changeLabel={label}
            />
            <StatCard
              label="Pending orders"
              icon={Timer}
              iconTone="amber"
              loading={!data}
              value={data ? formatNumber(data.stats.pendingOrders.value) : ""}
              hint="Awaiting action"
            />
            <StatCard
              label="Low stock products"
              icon={AlertTriangle}
              iconTone="red"
              loading={!data}
              value={data ? formatNumber(data.stats.lowStock.value) : ""}
              hint="Needs restocking"
            />
          </section>

          <section aria-label="Charts" className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Revenue" description="Paid and fulfilled order revenue over time">
              {data ? <RevenueChart data={data.series} /> : <Skeleton className="h-70 w-full" />}
            </Card>
            <Card title="Orders" description="Number of orders placed over time">
              {data ? <OrdersChart data={data.series} /> : <Skeleton className="h-70 w-full" />}
            </Card>
            <Card title="Order status" description="Share of orders by status">
              {data ? (
                data.statusBreakdown.some((s) => s.count > 0) ? (
                  <StatusDonut data={data.statusBreakdown} />
                ) : (
                  <EmptyState title="No orders in this period" />
                )
              ) : (
                <Skeleton className="h-70 w-full" />
              )}
            </Card>
            <Card title="Top products" description="Best sellers by units sold">
              {data ? (
                data.topProducts.length > 0 ? (
                  <TopProductsChart data={data.topProducts} metric="units" />
                ) : (
                  <EmptyState title="No sales in this period" />
                )
              ) : (
                <Skeleton className="h-70 w-full" />
              )}
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card
              title="Recent orders"
              className="xl:col-span-2"
              padded={false}
              actions={
                can("orders", "view") ? (
                  <Link href="/admin/orders" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                    View all
                  </Link>
                ) : undefined
              }
            >
              {!data ? (
                <div className="p-5">
                  <CardListSkeleton rows={5} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <caption className="sr-only">Most recent orders</caption>
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <tr>
                        <th scope="col" className="px-5 py-3">Order</th>
                        <th scope="col" className="px-5 py-3">Customer</th>
                        <th scope="col" className="hidden px-5 py-3 sm:table-cell">Date</th>
                        <th scope="col" className="px-5 py-3 text-right">Total</th>
                        <th scope="col" className="px-5 py-3">Status</th>
                        <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3 font-medium text-gray-900">{o.number}</td>
                          <td className="px-5 py-3 text-gray-700">{o.customerName}</td>
                          <td className="hidden px-5 py-3 text-gray-600 sm:table-cell">{formatDate(o.createdAt)}</td>
                          <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(o.total)}</td>
                          <td className="px-5 py-3"><StatusBadge kind="order" status={o.status} /></td>
                          <td className="px-5 py-3 text-right">
                            {can("orders", "view") && (
                              <Link
                                href={`/admin/orders/${o.id}`}
                                aria-label={`View order ${o.number}`}
                                className="text-sm font-medium text-brand-700 hover:text-brand-800"
                              >
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div className="space-y-6">
              <Card title="Low stock alerts" description="Active products at or below the threshold">
                {!data ? (
                  <CardListSkeleton rows={3} />
                ) : data.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-gray-600">Everything is well stocked.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.lowStockProducts.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <Thumb src={p.images[0]} emoji={p.emoji} name={p.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                          <p className={p.stock === 0 ? "text-xs font-medium text-red-700" : "text-xs font-medium text-amber-800"}>
                            {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                          </p>
                        </div>
                        {can("products", "edit") && (
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            aria-label={`Edit ${p.name}`}
                            className="text-sm font-medium text-brand-700 hover:text-brand-800"
                          >
                            Restock
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="New products">
                {!data ? (
                  <CardListSkeleton rows={3} />
                ) : (
                  <ul className="space-y-3">
                    {data.newProducts.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <Thumb src={p.images[0]} emoji={p.emoji} name={p.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">Added {formatDate(p.createdAt)}</p>
                        </div>
                        {can("products", "view") && (
                          <Link
                            href={`/admin/products/${p.id}`}
                            aria-label={`View ${p.name}`}
                            className="text-sm font-medium text-brand-700 hover:text-brand-800"
                          >
                            View
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
