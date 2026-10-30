"use client";

import { errorMessage } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Set false to skip fetching (e.g. while waiting for an id). Default true. */
  enabled?: boolean;
}

interface State<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
  { enabled = true }: Options = {},
) {
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    loading: enabled,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    // Keep old data on screen while re-fetching. Defer the update so it does
    // not run synchronously in the effect body.
    queueMicrotask(() => {
      if (!cancelled) setState((s) => ({ ...s, loading: true, error: null }));
    });

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((e: unknown) => {
        if (cancelled) return; // also covers AbortError from cleanup
        setState((s) => ({
          data: s.data,
          error: errorMessage(e, "Couldn't load data."),
          loading: false,
        }));
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadToken, ...deps]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  /** Update the data locally (optimistic updates, after a mutation, etc.). */
  const setData = useCallback(
    (updater: T | ((prev: T | null) => T | null)) =>
      setState((s) => ({
        ...s,
        data:
          typeof updater === "function"
            ? (updater as (prev: T | null) => T | null)(s.data)
            : updater,
      })),
    [],
  );

  return {
    data: state.data,
    error: state.error,
    /** True on the very first load (no data yet) → show a skeleton. */
    initialLoading: enabled && state.loading && !state.data && !state.error,
    /** True while re-fetching with data already on screen → dim the UI. */
    refreshing: enabled && state.loading && state.data !== null,
    loading: enabled && state.loading,
    reload,
    setData,
  };
}
