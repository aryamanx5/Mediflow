import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import { useCountUp } from "../../hooks/useCountUp";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Logo } from "../Logo";

/**
 * The hand-off from the marketing surface to the product. The panel lifts and
 * settles as it scrolls into place — a small piece of scroll choreography that
 * says "this is the actual software", then gets out of the way.
 */
export function DashboardPreview() {
  const ref = useReveal<HTMLElement>();
  const frameRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    const el = frameRef.current;
    if (!el) return;

    let ticking = false;
    const measure = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      // 0 while the panel is still below the fold, 1 once it is centred.
      const p = 1 - Math.min(1, Math.max(0, rect.top / (window.innerHeight * 0.9)));
      setProgress(p);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Layout above this panel can change without a scroll — fonts finishing,
    // lazy content appearing. Without re-measuring, the panel would stay stuck
    // at its dimmed entry state.
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [reduced]);

  const lift = {
    transform: `perspective(1400px) rotateX(${(1 - progress) * 7}deg) translateY(${(1 - progress) * 40}px) scale(${0.96 + progress * 0.04})`,
    opacity: 0.5 + progress * 0.5,
  };

  return (
    <section
      ref={ref}
      className="relative border-t border-line bg-ink text-paper py-24 sm:py-32 overflow-hidden"
    >
      {/* night ward: light passing down a darkened corridor, and the same
          vitals trace still running */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-[20%] -bottom-[20%] w-[22%]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0) 100%)",
            animation: "mf-beam 28s linear infinite",
          }}
        />
        <div
          className="absolute -top-[20%] -bottom-[20%] w-[14%]"
          style={{
            background:
              "linear-gradient(90deg, rgba(228,233,225,0) 0%, rgba(228,233,225,0.06) 50%, rgba(228,233,225,0) 100%)",
            animation: "mf-beam 37s linear -15s infinite",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-10 overflow-hidden opacity-20 text-sage-tint">
          <div className="absolute inset-0 w-[200%] a-trace-run" style={{ animationDuration: "5s" }}>
            <svg viewBox="0 0 800 60" preserveAspectRatio="none" fill="none" className="w-full h-full block">
              <path
                d="M0,34 L28,34 L36,20 L44,50 L52,34 L86,34 L94,28 L102,34 L140,34 L160,34 L168,20 L176,50 L184,34 L218,34 L226,28 L234,34 L272,34 L292,34 L300,20 L308,50 L316,34 L350,34 L358,28 L366,34 L400,34 L428,34 L436,20 L444,50 L452,34 L486,34 L494,28 L502,34 L540,34 L560,34 L568,20 L576,50 L584,34 L618,34 L626,28 L634,34 L672,34 L692,34 L700,20 L708,50 L716,34 L750,34 L758,28 L766,34 L800,34"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[86rem] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="u-eyebrow reveal text-sage-tint">The application</p>
          <h2
            className="u-display text-[clamp(2rem,4.6vw,3.3rem)] mt-4 reveal"
            style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
          >
            Past this point it stops
            <br />
            being a website.
          </h2>
          <p
            className="mt-5 text-[1.02rem] leading-relaxed text-paper/65 max-w-md reveal"
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          >
            The dashboard drops the theatrics: dense tables, real counts, and
            the four things you actually do all day.
          </p>
        </div>

        <div ref={frameRef} className="mt-14" style={reduced ? undefined : lift}>
          <MockDashboard />
        </div>

        <div
          className="mt-12 flex flex-wrap items-center gap-4 reveal"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
        >
          <Link
            to="/signin"
            className="inline-flex items-center h-12 px-7 rounded-full bg-paper text-ink text-[0.92rem] font-medium hover:bg-sage-tint transition-colors"
          >
            Enter dashboard
          </Link>
          <span className="u-meta text-paper/45">
            Sign in with your existing MediFlow account.
          </span>
        </div>
      </div>
    </section>
  );
}

function MockDashboard() {
  return (
    <div className="bg-paper text-ink rounded-xl border border-ink/10 overflow-hidden shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)]">
      {/* app chrome */}
      <div className="flex items-center gap-3 h-12 px-4 border-b border-line bg-panel">
        <Logo size={18} className="text-sage" />
        <span className="u-serif text-[0.95rem]">MediFlow</span>
        <span className="u-meta ml-4 hidden sm:inline">Overview</span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <nav className="hidden sm:flex flex-col gap-0.5 w-44 shrink-0 p-3 border-r border-line bg-panel">
          {["Overview", "Products", "Customers", "Orders"].map((l, i) => (
            <span
              key={l}
              className={
                "px-3 py-2 rounded-md text-[0.83rem] " +
                (i === 0 ? "bg-sage-tint text-sage font-medium" : "text-muted")
              }
            >
              {l}
            </span>
          ))}
        </nav>

        {/* content */}
        <div className="grow p-4 sm:p-6 min-w-0">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <CountStat label="Products" to={248} />
            <CountStat label="Customers" to={96} />
            <CountStat label="Orders" to={1204} />
          </div>

          <div className="mt-4 bg-panel border border-line rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line-soft">
              <p className="u-label text-[0.6rem]">
                Needs attention
                <span className="u-meta ml-2 normal-case tracking-normal">Sample data</span>
              </p>
            </div>
            {[
              ["Cough Linctus", "SAMPLE-04", "Out of stock", "text-danger bg-danger-tint"],
              ["Oral Rehydration Salts", "SAMPLE-03", "Low stock", "text-warn bg-warn-tint"],
              ["Antiseptic Solution", "SAMPLE-02", "Low stock", "text-warn bg-warn-tint"],
            ].map(([n, sku, s, tone]) => (
              <div
                key={sku}
                className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line-soft last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-[0.83rem] truncate">{n}</p>
                  <p className="u-meta font-mono text-[0.68rem]">{sku}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.66rem] font-medium ${tone}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A stat that counts up the first time it is scrolled into view. */
function CountStat({ label, to }: { label: string; to: number }) {
  const { ref, value } = useCountUp<HTMLDivElement>(to);
  return (
    <div ref={ref} className="bg-panel border border-line rounded-lg p-3 sm:p-4">
      <p className="u-label text-[0.58rem]">{label}</p>
      <p className="u-serif text-[1.6rem] sm:text-[2rem] mt-1 leading-none tabular">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
