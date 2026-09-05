import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePointer } from "../../hooks/usePointer";
import { useTypewriter } from "../../hooks/useTypewriter";
import { AmbientBackdrop } from "./AmbientBackdrop";
import { DoctorStage } from "./DoctorStage";
import { FloatingBadges } from "./FloatingBadges";
import { IVStand } from "./IVStand";
import { PharmacyObjects } from "./PharmacyObjects";
import { VitalsMonitor } from "./VitalsMonitor";

const LEDE =
  "Stock, customers and orders, held in one place and reconciled the moment anything moves.";

export function Hero() {
  const pointer = usePointer();
  const [mounted, setMounted] = useState(false);
  const { displayed, done } = useTypewriter(LEDE, 26, 900);

  // Timer rather than rAF: rAF is throttled in a background tab, and the
  // figure must not stay invisible for someone who opened the page in one.
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(id);
  }, []);

  return (
    <section
      id="main"
      className="relative min-h-[100svh] flex flex-col lg:flex-row lg:items-center overflow-hidden pt-[var(--nav-h)]"
    >
      <AmbientBackdrop />

      {/* The figure. On desktop it occupies the right half behind nothing; on
          mobile the hero is recomposed as a column and the figure takes the
          lower band, so it is never a backdrop the type has to fight. */}
      <div className="relative order-2 grow min-h-[46svh] w-full lg:order-none lg:absolute lg:inset-0 lg:left-[43%] lg:w-auto lg:min-h-0 lg:grow-0 pointer-events-none">
        {/* absolute rather than h-full: a percentage height does not resolve
            against a flex item that is sized by flex-grow, which collapsed the
            figure to zero height on mobile. */}
        <div className="absolute inset-0">
          <PharmacyObjects pointer={pointer} />
          <div
            className="absolute inset-x-0 bottom-0 top-0 lg:inset-y-[6%] transition-[opacity,transform] duration-[1400ms] ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(26px) scale(0.985)",
              transitionDelay: "260ms",
            }}
          >
            <div className="relative size-full">
              <DoctorStage />
              {/* The doctor himself never moves (see DoctorStage). Everything
                  around him does: the monitor's trace, the drip, the badges
                  and the pharmacy objects behind. */}
              <VitalsMonitor />
              <IVStand />
              <FloatingBadges />
            </div>
          </div>
        </div>
      </div>

      {/* type */}
      <div className="relative order-1 lg:order-none mx-auto max-w-[86rem] w-full px-5 sm:px-8 pt-8 pb-8 lg:py-0">
        <div className="max-w-xl lg:max-w-[31rem]">
          <p className="u-eyebrow a-rise" style={{ animationDelay: "120ms" }}>
            Pharmacy operations platform
          </p>

          <h1
            className="u-display text-[clamp(2.5rem,6.1vw,5.1rem)] mt-5 a-rise"
            style={{ animationDelay: "220ms" }}
          >
            Every medicine.
            <br />
            Every order.
            <br />
            <em>One</em> clear system.
          </h1>

          <p
            className="mt-6 text-[clamp(1rem,2.2vw,1.16rem)] leading-relaxed text-ink-soft max-w-md min-h-[4.5em] sm:min-h-[3.4em]"
            aria-label={LEDE}
          >
            <span aria-hidden>
              {displayed}
              {!done && <span className="caret" />}
            </span>
          </p>

          <div
            className="mt-7 flex flex-wrap items-center gap-3 a-rise"
            style={{ animationDelay: "560ms" }}
          >
            <Link
              to="/signin"
              className="inline-flex items-center h-12 px-7 rounded-full bg-ink text-paper text-[0.92rem] font-medium hover:bg-sage transition-colors"
            >
              Enter dashboard
            </Link>
            <a
              href="#product"
              className="inline-flex items-center h-12 px-7 rounded-full border border-line text-ink text-[0.92rem] hover:border-ink hover:bg-paper-warm transition-colors"
            >
              See how it works
            </a>
          </div>

          <dl
            className="hidden sm:flex mt-10 lg:mt-14 flex-wrap gap-x-8 gap-y-4 a-rise"
            style={{ animationDelay: "700ms" }}
          >
            {[
              ["Products", "SKU, stock and reorder floor"],
              ["Customers", "Contact and delivery records"],
              ["Orders", "Billing, GST and fulfilment"],
            ].map(([term, def]) => (
              <div key={term} className="max-w-[9.5rem]">
                <dt className="u-label text-ink">{term}</dt>
                <dd className="u-meta mt-1 leading-snug">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden
        className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 a-fade"
        style={{ animationDelay: "1.2s" }}
      >
        <span className="u-label text-[0.62rem]">Scroll</span>
        <span className="block w-px h-9 bg-gradient-to-b from-faint to-transparent a-breathe" />
      </div>
    </section>
  );
}
