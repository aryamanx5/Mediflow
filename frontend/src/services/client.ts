/**
 * The single place that talks to the existing Express backend.
 * Everything else in the app goes through here — no component calls fetch().
 */

const BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "mediflow.token";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
  /** The backend uses 401 for both "no token" and "bad credentials". */
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

/* --- token storage ------------------------------------------------------ */

let token: string | null = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
} catch {
  /* private mode / storage disabled — run tokenless for this session */
}

export function getToken() {
  return token;
}

export function setToken(next: string | null) {
  token = next;
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* non-fatal: the in-memory token still works for this session */
  }
}

/* --- listeners for global 401 (token expired mid-session) --------------- */

type Listener = () => void;
const expiryListeners = new Set<Listener>();

export function onAuthExpired(fn: Listener) {
  expiryListeners.add(fn);
  return () => {
    expiryListeners.delete(fn);
  };
}

/* --- request ------------------------------------------------------------ */

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new ApiError(
      "Can't reach the server. Check that the backend is running.",
      0,
    );
  }

  // Every controller responds with JSON, but a proxy error or a crash can
  // return HTML — don't let that surface as a parser stack trace.
  const raw = await res.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new ApiError(
        res.ok ? "Unexpected response from the server." : `Server error (${res.status}).`,
        res.status,
      );
    }
  }

  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      `Request failed (${res.status}).`;
    if (res.status === 401 && token) {
      // Token was present but rejected: it expired or was revoked.
      setToken(null);
      expiryListeners.forEach((fn) => fn());
    }
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

/** Builds a query string, dropping empty/undefined values entirely. */
export function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}
