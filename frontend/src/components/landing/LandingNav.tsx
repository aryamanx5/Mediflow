import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wordmark } from "../Logo";
import { cn } from "../../lib/cn";
import { useAuth } from "../../hooks/useAuth";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Inventory", href: "#inventory" },
  { label: "Orders", href: "#orders" },
  { label: "Platform", href: "#platform" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      setScrolled(window.scrollY > 24);
      // How far through the page we are, for the vitals bar under the nav.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The overlay owns the viewport while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const cta = isAuthenticated ? "Enter dashboard" : "Enter dashboard";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-90 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || menuOpen
            ? "bg-paper/85 backdrop-blur-md border-b border-line"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="mx-auto max-w-[86rem] px-5 sm:px-8 h-[var(--nav-h)] flex items-center justify-between gap-6">
          <Link to="/" className="shrink-0" aria-label="MediFlow home">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[0.88rem] text-ink-soft hover:text-ink transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-sage after:transition-[width] after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block shrink-0">
            <Link
              to={isAuthenticated ? "/app" : "/signin"}
              className="inline-flex items-center h-10 px-5 rounded-full bg-ink text-paper text-[0.85rem] font-medium hover:bg-sage transition-colors"
            >
              {cta}
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden -mr-2 size-11 grid place-items-center"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="relative block w-6 h-[14px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute left-0 block h-[1.5px] w-6 bg-ink transition-all duration-300",
                    i === 0 && (menuOpen ? "top-1.5 rotate-45" : "top-0"),
                    i === 1 && (menuOpen ? "top-1.5 opacity-0" : "top-1.5"),
                    i === 2 && (menuOpen ? "top-1.5 -rotate-45" : "top-3"),
                  )}
                />
              ))}
            </span>
          </button>
        </div>
        {/* the page's own vitals line: how far through the read you are */}
        <div aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden">
          <div
            className="h-full w-full origin-left"
            style={{
              transform: `scaleX(${progress})`,
              background:
                "linear-gradient(90deg, rgba(79,97,82,0) 0%, #4f6152 82%, #9c6b4f 100%)",
            }}
          />
        </div>
      </header>

      {/* mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-80 md:hidden bg-paper transition-opacity duration-300",
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col justify-center h-full px-7 gap-1 pt-[var(--nav-h)]">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="u-serif text-[2.1rem] py-2 border-b border-line-soft"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {l.label}
            </a>
          ))}
          <Link
            to={isAuthenticated ? "/app" : "/signin"}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            className="mt-8 inline-flex items-center justify-center h-12 rounded-full bg-ink text-paper text-[0.92rem] font-medium"
          >
            {cta}
          </Link>
        </div>
      </div>
    </>
  );
}
