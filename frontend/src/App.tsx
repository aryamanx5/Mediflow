import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import { Toaster } from "./components/ui/Toaster";
import { AppLayout } from "./layouts/AppLayout";
import { ScrollToTop } from "./components/ScrollToTop";

// The landing page pulls in Three.js; the dashboard should not pay for that,
// and vice versa. Splitting here keeps each entry lean.
const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Register = lazy(() => import("./pages/Register"));
const Overview = lazy(() => import("./pages/Overview"));
const Products = lazy(() => import("./pages/Products"));
const Customers = lazy(() => import("./pages/Customers"));
const Orders = lazy(() => import("./pages/Orders"));

function Booting() {
  return (
    <div className="min-h-svh grid place-items-center" role="status" aria-live="polite">
      <span className="u-meta">Loading…</span>
    </div>
  );
}

/** Gates the dashboard client-side and remembers where the user was headed. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Booting />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}

/** Signed-in users have no reason to see the sign-in screen. */
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <Booting />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Suspense fallback={<Booting />}>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route
                path="/signin"
                element={
                  <RedirectIfAuthed>
                    <SignIn />
                  </RedirectIfAuthed>
                }
              />
              <Route
                path="/register"
                element={
                  <RedirectIfAuthed>
                    <Register />
                  </RedirectIfAuthed>
                }
              />

              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Overview />} />
                <Route path="products" element={<Products />} />
                <Route path="customers" element={<Customers />} />
                <Route path="orders" element={<Orders />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
