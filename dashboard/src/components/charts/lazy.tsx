"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/admin/LoadingSkeleton";

/**
 * Lazy-loaded chart components. Recharts is browser-only (it measures the DOM),
 * so these skip SSR and show a skeleton until the chunk arrives.
 */
const loading = () => <ChartSkeleton />;

export const RevenueChart = dynamic(() => import("./charts").then((m) => m.RevenueChart), { ssr: false, loading });
export const OrdersChart = dynamic(() => import("./charts").then((m) => m.OrdersChart), { ssr: false, loading });
export const CustomersChart = dynamic(() => import("./charts").then((m) => m.CustomersChart), { ssr: false, loading });
export const StatusDonut = dynamic(() => import("./charts").then((m) => m.StatusDonut), { ssr: false, loading });
export const TopProductsChart = dynamic(() => import("./charts").then((m) => m.TopProductsChart), { ssr: false, loading });
export const StatusStackedChart = dynamic(() => import("./charts").then((m) => m.StatusStackedChart), { ssr: false, loading });
