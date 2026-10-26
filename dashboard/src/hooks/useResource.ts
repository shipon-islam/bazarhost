"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "@/lib/utils";

interface State<T> {
  loader: () => Promise<T>;
  token: number;
  data: T | null;
  error: string | null;
}

/**
 * Loads a single resource. `loader` MUST be memoised by the caller
 * (`useCallback`) so it only changes when the thing being loaded changes.
 */
export function useResource<T>(loader: () => Promise<T>) {
  const [token, setToken] = useState(0);
  const [state, setState] = useState<State<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => {
        if (!cancelled) setState({ loader, token, data, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ loader, token, data: null, error: errorMessage(e, "Couldn't load this item.") });
      });
    return () => {
      cancelled = true;
    };
  }, [loader, token]);

  const fresh = state !== null && state.loader === loader && state.token === token;
  const reload = useCallback(() => setToken((n) => n + 1), []);
  const setData = useCallback((data: T) => {
    setState((prev) => (prev ? { ...prev, data, error: null } : prev));
  }, []);

  return {
    data: state?.data ?? null,
    error: fresh ? state.error : null,
    loading: !fresh && !state?.data,
    reload,
    setData,
  };
}
