import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-gray-200/80", className)} />;
}

/** Rows used inside <tbody> while a table loads. */
export function TableSkeletonRows({ rows = 8, columns, selectable }: { rows?: number; columns: number; selectable?: boolean }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-t border-gray-100">
          {selectable && (
            <td className="w-10 px-4 py-3.5">
              <Skeleton className="h-4 w-4" />
            </td>
          )}
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className={cn("h-4", c === 0 ? "w-40" : c % 3 === 0 ? "w-16" : "w-24")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const SKELETON_BAR_HEIGHTS = [40, 65, 50, 80, 60, 90, 70, 55, 85, 45, 75, 95];

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div style={{ height }} className="flex items-end gap-2 px-2 pb-2" aria-busy="true" aria-label="Loading chart">
      {SKELETON_BAR_HEIGHTS.map((h, i) => (
        <div key={i} aria-hidden className="flex-1 animate-pulse rounded-t-md bg-gray-200/80" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
