"use client";
import { useRouter, useSearchParams } from "next/navigation";

const options = [
  ["popular", "Most popular"], ["rating", "Top rated"], ["new", "Newest"],
  ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"],
] as const;

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500">
      Sort by
      <select value={value} onChange={(e) => { const u = new URLSearchParams(params.toString()); u.set("sort", e.target.value); u.delete("page"); router.push(`/shop?${u.toString()}`); }}
        className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-navy-900 ring-1 ring-slate-300 outline-none focus:ring-brand">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
