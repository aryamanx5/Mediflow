import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/client";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch-with-lifecycle for a single async source.
 *
 * - aborts the in-flight request when deps change or the component unmounts
 * - ignores results from a superseded request (last-write-wins by sequence)
 * - exposes refresh() for post-mutation reloads
 */
export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
) {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const seq = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (signal: AbortSignal) => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current(signal);
      if (id !== seq.current || signal.aborted) return;
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (id !== seq.current || signal.aborted) return;
      if ((err as Error)?.name === "AbortError") return;
      setState({
        data: null,
        loading: false,
        error:
          err instanceof ApiError ? err.message : "Something went wrong.",
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void run(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    void run(controller.signal);
  }, [run]);

  return { ...state, refresh };
}
