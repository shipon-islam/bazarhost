"use client";

import { cn } from "@/lib/utils";
import type { RangeKey } from "@/types/common";

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "365d": "Last 12 months",
};

/** Segmented control (radio group) for the dashboard / report time range. */
export function DateRangeSelect({
  value,
  onChange,
  options,
  label = "Date range",
}: {
  value: RangeKey;
  onChange: (range: RangeKey) => void;
  options: RangeKey[];
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
            )}
          >
            {RANGE_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}
