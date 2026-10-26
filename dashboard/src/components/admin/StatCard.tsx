import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";
import { Skeleton } from "./LoadingSkeleton";

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeLabel = "vs previous period",
  iconTone = "blue",
  hint,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Percent change; null/undefined hides the indicator. */
  change?: number | null;
  changeLabel?: string;
  iconTone?: "blue" | "green" | "amber" | "purple" | "red" | "indigo";
  /** Shown instead of the change indicator (e.g. "Needs attention"). */
  hint?: string;
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-32" />
        <Skeleton className="mt-4 h-4 w-28" />
      </div>
    );
  }

  const up = (change ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[iconTone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {change !== null && change !== undefined ? (
          <>
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", up ? "text-green-700" : "text-red-700")}>
              {up ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
              <span className="sr-only">{up ? "Up" : "Down"} </span>
              {formatPercent(change)}
            </span>
            <span className="text-gray-500">{changeLabel}</span>
          </>
        ) : (
          <span className="text-gray-500">{hint ?? "Current total"}</span>
        )}
      </div>
    </div>
  );
}
