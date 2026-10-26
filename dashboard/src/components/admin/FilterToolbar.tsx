"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { SearchInput } from "./SearchInput";

/** Search box + filter controls + optional trailing actions, above a table. */
export function FilterToolbar({
  search,
  onSearch,
  searchPlaceholder,
  children,
  activeCount = 0,
  onReset,
  trailing,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder: string;
  children?: ReactNode;
  activeCount?: number;
  onReset?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center">
      <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} className="w-full lg:max-w-xs" />
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {children}
        {activeCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear filters
          </button>
        )}
      </div>
      {trailing && <div className="flex items-center gap-2">{trailing}</div>}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  /** Text for the "no filter" option, e.g. "All categories". */
  allLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-36", className)}>
      <Select compact aria-label={label} value={value || "all"} onChange={(e) => onChange(e.target.value)}>
        <option value="all">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Appears above a table while rows are selected. */
export function BulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex flex-wrap items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-2.5"
    >
      <p className="text-sm font-medium text-brand-900" aria-live="polite">
        {count} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <button type="button" onClick={onClear} className="ml-auto text-sm font-medium text-brand-700 hover:text-brand-900">
        Clear selection
      </button>
    </div>
  );
}
