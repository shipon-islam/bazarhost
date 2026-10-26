"use client";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

// Mobile: collapsible panel behind a Filters button. Desktop: always visible.
export default function FilterShell({ children, activeCount }: { children: React.ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-navy-900 ring-1 ring-slate-300 lg:hidden">
        <SlidersHorizontal size={16} aria-hidden /> Filters{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-xs text-white">{activeCount}</span>}
      </button>
      <div className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>{children}</div>
    </div>
  );
}
