"use client";

/**
 * Recharts wrappers shared by the dashboard and reports. This module is only
 * ever loaded through `next/dynamic` (see ./lazy.tsx) so Recharts stays out of
 * the bundles of pages that don't draw charts.
 *
 * Chart colours: Recharts needs literal colour strings, so they are mirrored
 * here from the brand tokens in globals.css. Keep the two in sync.
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency, formatNumber, titleCase } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";
import type { StatusSeriesPoint, StatusSlice, TimePoint, TopProduct } from "@/types/report";

export const CHART_COLORS = {
  primary: "#2563eb",
  secondary: "#0ea5e9",
  grid: "#e5e7eb",
  axis: "#6b7280",
} as const;

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#3b82f6",
  processing: "#6366f1",
  shipped: "#a855f7",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

const axisProps = {
  tick: { fontSize: 12, fill: CHART_COLORS.axis },
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  fontSize: 13,
} as const;

function labelInterval(count: number): number {
  return count > 14 ? Math.ceil(count / 8) - 1 : 0;
}

export function RevenueChart({ data, height = 280 }: { data: TimePoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label={`Revenue chart across ${data.length} periods`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" interval={labelInterval(data.length)} {...axisProps} />
          <YAxis width={56} tickFormatter={formatCompactCurrency} {...axisProps} />
          <Tooltip formatter={(v) => [formatCurrency(Number(v)), "Revenue"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data, height = 280 }: { data: TimePoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label={`Orders chart across ${data.length} periods`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.25} />
              <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" interval={labelInterval(data.length)} {...axisProps} />
          <YAxis width={40} allowDecimals={false} {...axisProps} />
          <Tooltip formatter={(v) => [formatNumber(Number(v)), "Orders"]} contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="orders" stroke={CHART_COLORS.secondary} strokeWidth={2.5} fill="url(#ordersFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomersChart({ data, height = 280 }: { data: TimePoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="New customers chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" interval={labelInterval(data.length)} {...axisProps} />
          <YAxis width={40} allowDecimals={false} {...axisProps} />
          <Tooltip formatter={(v) => [formatNumber(Number(v)), "New customers"]} contentStyle={tooltipStyle} cursor={{ fill: "#f3f4f6" }} />
          <Bar dataKey="customers" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ data, height = 280 }: { data: StatusSlice[]; height?: number }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div style={{ height }} role="img" aria-label="Orders by status">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((s) => (
              <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${formatNumber(Number(v))} (${total ? ((Number(v) / total) * 100).toFixed(1) : 0}%)`, titleCase(String(name))]}
            contentStyle={tooltipStyle}
          />
          <Legend formatter={(v) => <span className="text-xs text-gray-700">{titleCase(String(v))}</span>} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({
  data,
  metric = "units",
  height = 280,
}: {
  data: TopProduct[];
  metric?: "units" | "revenue";
  height?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label={`Top products by ${metric}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={metric === "revenue" ? formatCompactCurrency : undefined} {...axisProps} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tickFormatter={(v: string) => (v.length > 20 ? `${v.slice(0, 19)}…` : v)}
            {...axisProps}
          />
          <Tooltip
            formatter={(v) => [metric === "revenue" ? formatCurrency(Number(v)) : formatNumber(Number(v)), metric === "revenue" ? "Revenue" : "Units sold"]}
            contentStyle={tooltipStyle}
            cursor={{ fill: "#f3f4f6" }}
          />
          <Bar dataKey={metric} fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusStackedChart({ data, height = 300 }: { data: StatusSeriesPoint[]; height?: number }) {
  const statuses: OrderStatus[] = ["delivered", "shipped", "processing", "pending", "cancelled"];
  return (
    <div style={{ height }} role="img" aria-label="Orders by status over time">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" interval={labelInterval(data.length)} {...axisProps} />
          <YAxis width={40} allowDecimals={false} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f3f4f6" }} formatter={(v, name) => [formatNumber(Number(v)), titleCase(String(name))]} />
          <Legend formatter={(v) => <span className="text-xs text-gray-700">{titleCase(String(v))}</span>} iconType="circle" />
          {statuses.map((s) => (
            <Bar key={s} dataKey={s} stackId="status" fill={STATUS_COLORS[s]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
