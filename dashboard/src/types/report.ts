import type { Order, OrderStatus } from "./order";
import type { Product } from "./product";
import type { RangeKey } from "./common";

export interface TimePoint {
  label: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface StatusSlice {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  units: number;
  revenue: number;
}

export interface StatusSeriesPoint {
  label: string;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface SummaryStat {
  value: number;
  /** Percentage change vs the previous period; null = not applicable. */
  change: number | null;
}

export interface DashboardData {
  range: RangeKey;
  stats: {
    revenue: SummaryStat;
    orders: SummaryStat;
    products: SummaryStat;
    customers: SummaryStat;
    pendingOrders: SummaryStat;
    lowStock: SummaryStat;
  };
  series: TimePoint[];
  statusBreakdown: StatusSlice[];
  topProducts: TopProduct[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  newProducts: Product[];
}

export interface ReportData {
  range: RangeKey;
  series: TimePoint[];
  statusSeries: StatusSeriesPoint[];
  statusBreakdown: StatusSlice[];
  topProducts: TopProduct[];
  totals: { revenue: number; orders: number; customers: number; avgOrderValue: number };
}
