import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/cn";
import { PageBackdrop, type BackdropName } from "../components/PageBackdrop";
import { initials } from "../lib/format";

const NAV = [
  { to: "/app", label: "Overview", end: true, icon: GridIcon },
  { to: "/app/products", label: "Products", icon: BoxIcon },
  { to: "/app/customers", label: "Customers", icon: PersonIcon },
  { to: "/app/orders", label: "Orders", icon: ReceiptIcon },
];

/**
 * Which room sits behind which screen. Anything not listed — the overview —
 * falls back to the corridor, the same way the landing page opens on one.
 */
const SECTION_BACKDROP: Record<string, BackdropName> = {
  products: "products",
  customers: "customers",
  orders: "orders",
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("mediflow.token");
  const isDemo = token ? JSON.parse(atob(token.split(".")[1])).isDemo : false;
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setNavOpen(false), [location.pathname]);

  // "/app/products" -> "products"; "/app" -> "" -> the corridor default.
  const section = location.pathname.replace(/^\/app\/?/, "").split("/")[0];
  const backdrop = SECTION_BACKDROP[section] ?? "dashboard";

  const signOut = () => {
    // Leave the guarded area first. Clearing the session while still on an
    // /app route lets RequireAuth's redirect win the race and dump the user on
    // the sign-in wall instead of the public site they asked for.
    navigate("/", { replace: true });
    logout();
  };

  return (
    <div className="app-shell min-h-svh flex" data-room={backdrop}>
      <PageBackdrop name={backdrop} />

      {/* --- sidebar --- */}
      <aside
        className={cn(
          "fixed lg:sticky inset-y-0 left-0 z-70 w-60 shrink-0 h-svh",
          "surface surface-nav border-y-0 border-l-0 flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          to="/app"
          className="h-14 flex items-center gap-2.5 px-4 border-b border-line-soft shrink-0 hover:bg-paper-warm transition-colors"
          aria-label="MediFlow — go to overview"
        >
          <Logo size={20} className="text-sage" />
          <span className="u-serif text-[1.05rem]">MediFlow</span>
        </Link>

        <nav aria-label="Sections" className="p-3 grow overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, end, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-3 h-9 rounded-md text-[0.85rem] transition-colors",
                      isActive
                        ? "bg-sage-tint text-sage font-medium"
                        : "text-muted hover:text-ink hover:bg-paper-warm",
                    )
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-line-soft shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <span
              aria-hidden
              className="size-8 shrink-0 rounded-full bg-sage-tint text-sage grid place-items-center text-[0.72rem] font-semibold"
            >
              {user ? initials(user.name) : "—"}
            </span>
            <div className="min-w-0">
              <p className="text-[0.82rem] truncate">{user?.name ?? "Signed in"}</p>
              <p className="u-meta text-[0.7rem] truncate">{user?.role ?? "Session active"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
            Sign out
          </Button>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-60 bg-ink/30 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden
        />
      )}

      {/* --- content --- */}
      <div className="relative z-10 grow min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-50 h-14 flex items-center gap-3 px-4 surface surface-nav border-x-0 border-t-0">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className="-ml-2 size-10 grid place-items-center rounded-md text-ink hover:bg-paper-warm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
              <path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <Link to="/app" className="inline-flex items-center gap-2.5" aria-label="MediFlow — go to overview">
            <Logo size={19} className="text-sage" />
            <span className="u-serif text-[1.02rem]">MediFlow</span>
          </Link>
        </header>

        <main className="grow min-w-0">
          {isDemo && (
            <div className="bg-amber/15 border-b border-amber/30 px-4 sm:px-7 py-3 flex items-center gap-2 text-amber text-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" />
                <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span>You're viewing the demo account (read-only).</span>
              <a href="/signin" className="ml-auto font-medium underline underline-offset-2 hover:no-underline">
                Sign in to your account
              </a>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* --- page header, shared by every screen inside the app --- */

export function PageHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="surface surface-panel flex flex-wrap items-end justify-between gap-4 rounded-xl px-5 py-4 mb-5">
      <div>
        <h1 className="u-serif text-[1.75rem] leading-tight">{title}</h1>
        {meta && <p className="u-meta mt-1">{meta}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * The content column.
 *
 * Deliberately narrower than the space available and generously inset. Glass
 * only reads as glass when there is un-glassed room around it: at the old
 * 82rem the panels ran nearly edge to edge, so every pixel of the photograph
 * was seen through a surface and the whole page looked like one frosted wall.
 * The gutters this leaves — top, bottom and both sides — are where the room
 * is seen at full contrast, and they are what the panels read as floating on.
 *
 * 58rem is the floor, not a target to shrink toward. It is set by the widest
 * table in the app — Orders, at seven columns plus the row actions — which
 * needs roughly this much before the totals and status columns start
 * crowding each other. Wider screens spend their extra space on the gutters
 * rather than on the panels, so the composition holds at any size.
 */
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 sm:px-7 py-7 sm:py-12 max-w-[58rem] mx-auto">{children}</div>
  );
}

/* --- icons: 16px, 1.4 stroke, drawn to sit on the same optical baseline --- */

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="0.7" y="0.7" width="5.3" height="5.3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="0.7" width="5.3" height="5.3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="0.7" y="9" width="5.3" height="5.3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5.3" height="5.3" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
export function BoxIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M7.5 1L14 4.4v6.2L7.5 14 1 10.6V4.4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1 4.4l6.5 3.3 6.5-3.3M7.5 7.7V14" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
export function PersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="7.5" cy="4.6" r="3.1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.4 14c0-3.2 2.7-4.9 6.1-4.9s6.1 1.7 6.1 4.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
export function ReceiptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M2.4 1h10.2v13l-2-1.3-2 1.3-2-1.3-2 1.3-2.2-1.3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 4.6h5M5 7.4h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
