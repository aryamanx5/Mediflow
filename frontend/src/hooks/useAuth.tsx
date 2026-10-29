import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth as authApi, users } from "../services/api";
import { getToken, onAuthExpired, setToken } from "../services/client";
import type { User } from "../services/types";

interface AuthValue {
  user: User | null;
  /** True while the stored token is being exchanged for a profile on boot. */
  booting: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
  const [booting, setBooting] = useState(() => Boolean(getToken()));

  // The backend's login response carries a token only, so the profile is
  // fetched separately — both on boot and after a fresh sign-in.
  const loadProfile = useCallback(async (signal?: AbortSignal) => {
    const { data } = await users.profile(signal);
    setUser(data);
    return data;
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setBooting(false);
      return;
    }
    const controller = new AbortController();
    loadProfile(controller.signal)
      .then(() => setBooting(false))
      .catch((err: unknown) => {
        // An aborted request says nothing about the token's validity — it
        // means this effect was torn down (React's double-mount in dev, or a
        // navigation). Clearing the session here would sign the user out on
        // every refresh.
        if ((err as Error)?.name === "AbortError" || controller.signal.aborted) {
          return;
        }
        // Anything else means the stored token is no good.
        setToken(null);
        setHasToken(false);
        setUser(null);
        setBooting(false);
      });
    return () => controller.abort();
  }, [loadProfile]);

  // A 401 on any later request means the session ended underneath us.
  useEffect(
    () =>
      onAuthExpired(() => {
        setUser(null);
        setHasToken(false);
      }),
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setHasToken(true);
      try {
        await loadProfile();
      } catch {
        // Profile is a nicety, not a gate: the token is valid, so let the
        // user in and show a neutral identity rather than blocking sign-in.
      }
    },
    [loadProfile],
  );

  const register = useCallback(
    async (body: { name: string; email: string; password: string }) => {
      await authApi.register(body);
      // The backend issues no token on register — the caller sends the user
      // to sign in. Deliberately not auto-logging-in behind their back.
    },
    [],
  );

  const demoLogin = useCallback(async () => {
    const res = await authApi.demo();
    setToken(res.token);
    setHasToken(true);
    try {
      await loadProfile();
    } catch {
      // Profile is a nicety; demo token is valid, so let them in
    }
  }, [loadProfile]);

  const logout = useCallback(() => {
    setToken(null);
    setHasToken(false);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      booting,
      isAuthenticated: hasToken,
      isAdmin: user?.role === "Admin",
      login,
      register,
      demoLogin,
      logout,
    }),
    [user, booting, hasToken, login, register, demoLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
