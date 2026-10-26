import { cn, titleCase } from "@/lib/utils";
import type { BadgeTone } from "@/types/common";

const TONES: Record<BadgeTone, { wrap: string; dot: string }> = {
  green: { wrap: "bg-green-50 text-green-800 ring-green-600/20", dot: "bg-green-600" },
  red: { wrap: "bg-red-50 text-red-800 ring-red-600/20", dot: "bg-red-600" },
  blue: { wrap: "bg-blue-50 text-blue-800 ring-blue-600/20", dot: "bg-blue-600" },
  amber: { wrap: "bg-amber-50 text-amber-900 ring-amber-600/25", dot: "bg-amber-500" },
  gray: { wrap: "bg-gray-100 text-gray-700 ring-gray-500/20", dot: "bg-gray-500" },
  purple: { wrap: "bg-purple-50 text-purple-800 ring-purple-600/20", dot: "bg-purple-600" },
  indigo: { wrap: "bg-indigo-50 text-indigo-800 ring-indigo-600/20", dot: "bg-indigo-600" },
};

export type BadgeKind = "order" | "payment" | "product" | "category" | "user" | "stock";

const MAP: Record<BadgeKind, Record<string, { tone: BadgeTone; label?: string }>> = {
  order: {
    pending: { tone: "blue" },
    processing: { tone: "indigo" },
    shipped: { tone: "purple" },
    delivered: { tone: "green" },
    cancelled: { tone: "red" },
  },
  payment: {
    paid: { tone: "green" },
    pending: { tone: "amber" },
    failed: { tone: "red" },
    refunded: { tone: "gray" },
  },
  product: {
    active: { tone: "green" },
    draft: { tone: "amber" },
    archived: { tone: "gray" },
  },
  category: {
    active: { tone: "green" },
    hidden: { tone: "gray" },
  },
  user: {
    active: { tone: "green" },
    disabled: { tone: "gray" },
    suspended: { tone: "red" },
  },
  stock: {
    in_stock: { tone: "green", label: "In stock" },
    low: { tone: "amber", label: "Low stock" },
    out_of_stock: { tone: "red", label: "Out of stock" },
  },
};

/** Colour + dot + text: status is never conveyed by colour alone. */
export function StatusBadge({ kind, status, className }: { kind: BadgeKind; status: string; className?: string }) {
  const entry = MAP[kind][status] ?? { tone: "gray" as BadgeTone };
  const tone = TONES[entry.tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tone.wrap,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
      {entry.label ?? titleCase(status)}
    </span>
  );
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card",
  cod: "Cash on delivery",
};
