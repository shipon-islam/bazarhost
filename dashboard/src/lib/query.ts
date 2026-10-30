import { ListQuery } from "@/types/common";

export function toParams(q: ListQuery) {
  const params: Record<string, string | number> = {
    page: q.page,
    limit: q.pageSize, // pageSize → limit
  };

  if (q.search?.trim()) params.search = q.search.trim();

  if (q.sortBy) {
    params.sortBy = q.sortBy;
    params.order = q.sortDir ?? "asc"; // sortDir → order
  }

  for (const [k, v] of Object.entries(q.filters ?? {})) {
    if (v && v !== "all") params[k] = v; // flatten filters, drop "all"
  }

  return params;
}
