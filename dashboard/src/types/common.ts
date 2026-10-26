export type SortDir = "asc" | "desc";

/** Generic list query. Filter values of "" or "all" mean "no filter". */
export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Record<string, string>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type RangeKey = "today" | "7d" | "30d" | "90d" | "365d";

export type BadgeTone = "green" | "red" | "blue" | "amber" | "gray" | "purple" | "indigo";
