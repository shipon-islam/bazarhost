"use client";

import { Checkbox } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/types/common";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorState } from "./EmptyState";
import { TableSkeletonRows } from "./LoadingSkeleton";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Server-side sort key. Omit to make the column non-sortable. */
  sortKey?: string;
  align?: "left" | "right" | "center";
  className?: string;
  /** Hide the column below this breakpoint so the table fits small screens. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  /** Visually hide the header text (e.g. the actions column). */
  srOnlyHeader?: boolean;
}

export interface SelectionProps {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleMany: (ids: string[], on: boolean) => void;
}

const HIDE: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function DataTable<T>({
  label,
  columns,
  rows,
  rowKey,
  loading = false,
  refreshing = false,
  error,
  onRetry,
  empty,
  sort,
  onSort,
  selection,
  skeletonRows = 8,
}: {
  /** Accessible table name (rendered as a visually-hidden caption). */
  label: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Shown when there are no rows (and not loading). */
  empty: ReactNode;
  sort?: { by?: string; dir: SortDir };
  onSort?: (sortKey: string) => void;
  selection?: SelectionProps;
  skeletonRows?: number;
}) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!loading && rows.length === 0) return <>{empty}</>;

  const ids = rows.map(rowKey);
  const allSelected =
    selection !== undefined &&
    ids.length > 0 &&
    ids.every((id) => selection.selected.has(id));
  const someSelected =
    selection !== undefined && ids.some((id) => selection.selected.has(id));
  return (
    <div className="overflow-x-auto" aria-busy={loading || refreshing}>
      <table
        className={cn(
          "w-full min-w-max text-left text-sm transition-opacity",
          refreshing && "opacity-60",
        )}
      >
        <caption className="sr-only">{label}</caption>
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <tr>
            {selection && (
              <th scope="col" className="w-10 px-4 py-3">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={allSelected}
                  disabled={loading}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) =>
                    selection.onToggleMany(ids, e.target.checked)
                  }
                />
              </th>
            )}
            {columns.map((col) => {
              const sorted =
                col.sortKey !== undefined && sort?.by === col.sortKey;
              const ariaSort = sorted
                ? sort?.dir === "asc"
                  ? "ascending"
                  : "descending"
                : col.sortKey
                  ? "none"
                  : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn(
                    "whitespace-nowrap px-4 py-3",
                    ALIGN[col.align ?? "left"],
                    col.hideBelow && HIDE[col.hideBelow],
                  )}
                >
                  {col.srOnlyHeader ? (
                    <span className="sr-only">{col.header}</span>
                  ) : col.sortKey && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.sortKey as string)}
                      className={cn(
                        "-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 uppercase tracking-wide transition-colors hover:text-gray-900",
                        sorted && "text-gray-900",
                      )}
                    >
                      {col.header}
                      {sorted ? (
                        sort?.dir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown
                          className="h-3.5 w-3.5 text-gray-400"
                          aria-hidden
                        />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <TableSkeletonRows
              rows={skeletonRows}
              columns={columns.length}
              selectable={Boolean(selection)}
            />
          ) : (
            rows.map((row) => {
              const id = rowKey(row);
              const isSelected = selection?.selected.has(id) ?? false;
              return (
                <tr
                  key={id}
                  className={cn(
                    "transition-colors hover:bg-gray-50/70",
                    isSelected && "bg-brand-50/60",
                  )}
                >
                  {selection && (
                    <td className="w-10 px-4 py-3">
                      <Checkbox
                        aria-label="Select row"
                        checked={isSelected}
                        onChange={() => selection.onToggle(id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 align-middle text-gray-700",
                        ALIGN[col.align ?? "left"],
                        col.hideBelow && HIDE[col.hideBelow],
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
