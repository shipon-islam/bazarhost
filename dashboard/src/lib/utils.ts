import { ApiError } from "./errors";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const TZ = "Asia/Dhaka";

const numberFmt = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

export function formatNumber(n: number): string {
  return numberFmt.format(n);
}

/** Bangladeshi taka, e.g. ৳12,500. */
export function formatCurrency(n: number): string {
  return `৳${numberFmt.format(Math.round(n))}`;
}

/** Compact form for chart axes, e.g. ৳1.2L is avoided in favour of ৳120k for clarity. */
export function formatCompactCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `৳${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `৳${Math.round(n / 1_000)}k`;
  return `৳${Math.round(n)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** YYYY-MM-DD in the store timezone (used for the date-range filter). */
export function toDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}

export function formatPercent(n: number): string {
  return `${Math.abs(n).toFixed(1)}%`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Lowercase, ASCII, hyphen-separated slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

type CsvCell = string | number | boolean | null | undefined;

function csvCell(value: CsvCell): string {
  let s = value === null || value === undefined ? "" : String(value);
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell).
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: CsvCell[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** Browser-only: triggers a CSV download. */
export function downloadCsv(filename: string, rows: CsvCell[][]): void {
  const blob = new Blob(["﻿" + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function errorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (err instanceof Error && err.message) return err.message;
  if (err instanceof ApiError) {
    return err.message;
  }
  return fallback;
}
