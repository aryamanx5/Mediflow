import { useEffect, useState } from "react";

/** Keeps search boxes from firing a request per keystroke. */
export function useDebounced<T>(value: T, delay = 320) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
