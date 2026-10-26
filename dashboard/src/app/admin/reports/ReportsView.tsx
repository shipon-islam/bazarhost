"use client";

import { useCallback, useState } from "react";
import { BarChart3, CircleDollarSign, Download, ShoppingCart, Users, Package } from "lucide-react";
import { DateRangeSelect, RANGE_LABELS } from "@/components/admin/DateRangeSelect";
import { EmptyState, ErrorState } from "@/components/admin/EmptyState";
import { ChartSkeleton } from "@/components/admin/LoadingSkeleton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import {
  CustomersChart,
  OrdersChart,
  RevenueChart,
  StatusDonut,
  StatusStackedChart,
  TopProductsChart,
} from "@/components/charts/lazy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/form";
import { TabPanel, Tabs, type TabDef } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useResource } from "@/hooks/useResource";
import { getReports } from "@/lib/api";
import { downloadCsv, formatCurrency, formatNumber } from "@/lib/utils";
import type { RangeKey } from "@/types/common";
import type { ReportData } from "@/types/report";

const RANGES: RangeKey[] = ["7d", "30d", "90d", "365d"];
type TabId = "revenue" | "orders" | "products" | "customers";

const TABS: TabDef<TabId>[] = [
  { id: "revenue", label: "Revenue", icon: <CircleDollarSign className="h-4 w-4" aria-hidden /> },
  { id: "orders", label: "Orders", icon: <ShoppingCart className="h-4 w-4" aria-hidden /> },
  { id: "products", label: "Products", icon: <Package className="h-4 w-4" aria-hidden /> },
  { id: "customers", label: "Customers", icon: <Users className="h-4 w-4" aria-hidden /> },
];

function csvFor(tab: TabId, d: ReportData): { file: string; rows: Array<Array<string | number>> } {
  switch (tab) {
    case "revenue":
      return { file: `revenue-${d.range}.csv`, rows: [["Period", "Revenue (BDT)"], ...d.series.map((p) => [p.label, p.revenue])] };
    case "orders":
      return {
        file: `orders-${d.range}.csv`,
        rows: [
          ["Period", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
          ...d.statusSeries.map((p) => [p.label, p.pending, p.processing, p.shipped, p.delivered, p.cancelled]),
        ],
      };
    case "products":
      return {
        file: `top-products-${d.range}.csv`,
        rows: [["Product", "Units sold", "Revenue (BDT)"], ...d.topProducts.map((p) => [p.name, p.units, p.revenue])],
      };
    case "customers":
      return { file: `new-customers-${d.range}.csv`, rows: [["Period", "New customers"], ...d.series.map((p) => [p.label, p.customers])] };
  }
}

export function ReportsView() {
  const toast = useToast();
  const [range, setRange] = useState<RangeKey>("30d");
  const [tab, setTab] = useState<TabId>("revenue");
  const loader = useCallback(() => getReports(range), [range]);
  const { data, error, reload } = useResource(loader);
  const stale = data !== null && data.range !== range;

  const exportTab = () => {
    if (!data) return;
    const { file, rows } = csvFor(tab, data);
    downloadCsv(file, rows);
    toast.success("Export ready", `${file} (mock data)`);
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales and customer insights. Figures are mock data for demonstration."
        actions={
          <Button variant="secondary" onClick={exportTab} disabled={!data || stale}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Showing {RANGE_LABELS[range].toLowerCase()}</p>
        <DateRangeSelect value={range} onChange={setRange} options={RANGES} />
      </div>

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white"><ErrorState message={error} onRetry={reload} /></div>
      ) : (
        <div className={stale ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={!data || stale}>
          <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" icon={CircleDollarSign} iconTone="green" loading={!data} value={data ? formatCurrency(data.totals.revenue) : ""} change={null} hint="Paid and fulfilled orders" />
            <StatCard label="Orders" icon={ShoppingCart} iconTone="blue" loading={!data} value={data ? formatNumber(data.totals.orders) : ""} change={null} hint="All statuses" />
            <StatCard label="Average order value" icon={BarChart3} iconTone="indigo" loading={!data} value={data ? formatCurrency(data.totals.avgOrderValue) : ""} change={null} hint="Revenue ÷ paying orders" />
            <StatCard label="New customers" icon={Users} iconTone="purple" loading={!data} value={data ? formatNumber(data.totals.customers) : ""} change={null} hint="Registered in this period" />
          </section>

          <div className="mt-6">
            <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix="reports" label="Report type" />

            <TabPanel idPrefix="reports" id="revenue" active={tab === "revenue"}>
              <Card title="Revenue over time">{data ? <RevenueChart data={data.series} height={340} /> : <ChartSkeleton height={340} />}</Card>
            </TabPanel>

            <TabPanel idPrefix="reports" id="orders" active={tab === "orders"}>
              <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Orders by status over time" className="lg:col-span-2">
                  {data ? <StatusStackedChart data={data.statusSeries} height={340} /> : <ChartSkeleton height={340} />}
                </Card>
                <Card title="Status breakdown">
                  {data ? (
                    data.statusBreakdown.some((s) => s.count > 0) ? (
                      <StatusDonut data={data.statusBreakdown} height={340} />
                    ) : (
                      <EmptyState title="No orders in this period" />
                    )
                  ) : (
                    <ChartSkeleton height={340} />
                  )}
                </Card>
                <Card title="Order volume" className="lg:col-span-3">
                  {data ? <OrdersChart data={data.series} height={260} /> : <ChartSkeleton height={260} />}
                </Card>
              </div>
            </TabPanel>

            <TabPanel idPrefix="reports" id="products" active={tab === "products"}>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Top products by units sold">
                  {data ? (
                    data.topProducts.length > 0 ? (
                      <TopProductsChart data={data.topProducts} metric="units" height={360} />
                    ) : (
                      <EmptyState title="No sales in this period" />
                    )
                  ) : (
                    <ChartSkeleton height={360} />
                  )}
                </Card>
                <Card title="Top products by revenue" padded={false}>
                  {data ? (
                    data.topProducts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left text-sm">
                          <caption className="sr-only">Top products with units sold and revenue</caption>
                          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            <tr>
                              <th scope="col" className="px-5 py-3">Product</th>
                              <th scope="col" className="px-5 py-3 text-right">Units</th>
                              <th scope="col" className="px-5 py-3 text-right">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {[...data.topProducts]
                              .sort((a, b) => b.revenue - a.revenue)
                              .map((p) => (
                                <tr key={p.productId}>
                                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                                  <td className="px-5 py-3 text-right text-gray-700">{formatNumber(p.units)}</td>
                                  <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(p.revenue)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="No sales in this period" />
                    )
                  ) : (
                    <div className="p-5"><ChartSkeleton height={260} /></div>
                  )}
                </Card>
              </div>
            </TabPanel>

            <TabPanel idPrefix="reports" id="customers" active={tab === "customers"}>
              <Card title="New customers over time" description={data ? `${formatNumber(data.totals.customers)} new customers in this period` : undefined}>
                {data ? <CustomersChart data={data.series} height={340} /> : <ChartSkeleton height={340} />}
              </Card>
            </TabPanel>
          </div>
        </div>
      )}
    </>
  );
}
