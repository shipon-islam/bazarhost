"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { errorMessage } from "@/lib/utils";
import type { ListQuery, Paginated, SortDir } from "@/types/common";
import { useDebounce } from "./useDebounce";

interface Initial {
  search?: string;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Record<string, string>;
}

interface Result<T> {
  key: string;
  data: Paginated<T> | null;
  error: string | null;
}

/**
 * Search / filter / sort / paginate state for a list page, wired to an async fetcher.
 * `fetcher` must be a stable reference (module-level API function).
 */
export function useListQuery<T>(fetcher: (q: ListQuery) => Promise<Paginated<T>>, initial: Initial = {}) {
  const [search, setSearchValue] = useState(initial.search ?? "");
  const [filters, setFilters] = useState<Record<string, string>>(initial.filters ?? {});
  const [sortBy, setSortBy] = useState<string | undefined>(initial.sortBy);
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir ?? "asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeValue] = useState(initial.pageSize ?? 10);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState<Result<T>>({ key: "", data: null, error: null });

  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo<ListQuery>(
    () => ({ search: debouncedSearch, page, pageSize, sortBy, sortDir, filters }),
    [debouncedSearch, page, pageSize, sortBy, sortDir, filters],
  );
  const key = useMemo(() => JSON.stringify([query, reloadToken]), [query, reloadToken]);

  useEffect(() => {
    let cancelled = false;
    fetcher(query)
      .then((data) => {
        if (cancelled) return;
        setResult({ key, data, error: null });
        if (data.page !== query.page) setPage(data.page); // server clamped an out-of-range page
      })
      .catch((e: unknown) => {
        if (!cancelled) setResult({ key, data: null, error: errorMessage(e, "Couldn't load data.") });
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, query, key]);

  const loading = result.key !== key;

  const setSearch = useCallback((v: string) => {
    setSearchValue(v);
    setPage(1);
  }, []);
  const setFilter = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);
  const setPageSize = useCallback((n: number) => {
    setPageSizeValue(n);
    setPage(1);
  }, []);
  const toggleSort = useCallback(
    (by: string) => {
      if (sortBy === by) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortBy(by);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortBy],
  );
  const reload = useCallback(() => setReloadToken((n) => n + 1), []);
  const resetFilters = useCallback(() => {
    setSearchValue("");
    setFilters(initial.filters ?? {});
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFilterCount =
    Object.values(filters).filter((v) => v && v !== "all").length + (search.trim() ? 1 : 0);

  return {
    data: result.data,
    error: result.error,
    /** True on the very first load (no data to show yet) → render skeleton rows. */
    initialLoading: loading && !result.data && !result.error,
    /** True while re-fetching with data already on screen → dim the table. */
    refreshing: loading && Boolean(result.data),
    search,
    filters,
    sort: { by: sortBy, dir: sortDir },
    page,
    pageSize,
    activeFilterCount,
    setSearch,
    setFilter,
    setPage,
    setPageSize,
    toggleSort,
    reload,
    resetFilters,
    /** Current query without pagination: handy for CSV export. */
    query,
  };
}
