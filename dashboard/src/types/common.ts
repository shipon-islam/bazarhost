export type SortDir = "asc" | "desc";

/** Generic list query. Filter values of "" or "all" mean "no filter". */
export interface ListQuery {
  search?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Record<string, string>;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: PageMeta;
}

export interface BulkResult {
  done: number;
  skipped: number;
  /** Optional explanation shown in the toast when some items were skipped. */
  reason?: string;
}
export type RangeKey = "today" | "7d" | "30d" | "90d" | "365d";

export type BadgeTone =
  | "green"
  | "red"
  | "blue"
  | "amber"
  | "gray"
  | "purple"
  | "indigo";
