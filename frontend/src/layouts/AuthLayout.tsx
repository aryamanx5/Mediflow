import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DoctorStage } from "../components/landing/DoctorStage";
import { Wordmark } from "../components/Logo";
import { CORRIDOR_SRC } from "../assets/corridor/config";

/**
 * Auth sits visually between the landing page and the product: it keeps the
 * figure and the editorial type, but drops the motion and the 3D scene — this
 * is a screen people need to get through, not one to linger on.
 *
 * The right panel matches design_handoff_auth/Auth.dc.html exactly: values
 * below are copied from that file, not re-derived — see AuthLayout's inline
 * comments for which number came from where. --ease-out-quint is the
 * handoff's cubic-bezier(.22,1,.36,1); the animation keyframes are in
 * ../styles/auth.css.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      <div className="flex flex-col px-6 sm:px-12 lg:px-16 py-8 lg:py-12">
        <Link to="/" className="inline-flex w-fit" aria-label="MediFlow home">
          <Wordmark />
        </Link>

        <div className="grow flex flex-col justify-center max-w-md w-full py-12">
          <h1 className="u-display text-[clamp(2.1rem,5vw,3rem)] mb-3">{title}</h1>
          <p className="u-meta mb-10">{subtitle}</p>
          {children}
        </div>

        <p className="u-meta">
          <Link to="/" className="hover:text-ink transition-colors">
            ← Back to the site
          </Link>
        </p>
      </div>

      <aside
        className="hidden lg:block relative overflow-hidden border-l border-line"
        style={{ background: "linear-gradient(200deg,#eef1ea 0%,#e4e9e1 55%,#d8ded5 100%)" }}
        aria-hidden
      >
        {/* corridor photo — ken-burns, 32s. Falls back to a wash in the same
            palette until src/assets/corridor/corridor.* is installed; see
            that folder's config.ts for the drop-in contract. */}
        {CORRIDOR_SRC ? (
          <img
            src={CORRIDOR_SRC}
            alt=""
            className="absolute inset-0 size-full object-cover a-kenburns"
          />
        ) : (
          <div
            className="absolute inset-0 a-kenburns"
            style={{
              background:
                "linear-gradient(155deg, #dfe6df 0%, #e9ede6 38%, #cfd9d2 70%, #dbe2da 100%)",
            }}
          />
        )}

        {/* overlay wash — brings the photo back toward the panel's own tone */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(200deg, rgba(238,241,234,0.55) 0%, rgba(228,233,225,0.35) 50%, rgba(216,222,213,0.75) 100%)",
          }}
        />

        {/* light beam — a skewed strip sweeping the panel every 24s */}
        <div
          className="absolute -top-[20%] -bottom-[20%] w-[18%] a-beam"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* the figure, the monitor card and the cross badge share one box so
            the card/badge percentages below resolve against the same
            dimensions the doctor image itself fills */}
        <div
          className="absolute inset-y-[7%] inset-x-[10%]"
          style={{ animation: "mf-rise-far 1.3s var(--ease-out-quint) 0.2s both" }}
        >
          <div className="relative size-full">
            <DoctorStage dim />

            {/* "Ward 02" monitor card */}
            <div
              className="absolute w-[13rem] rounded-xl border border-line py-3 px-[0.85rem] backdrop-blur-[6px] shadow-[0_28px_60px_-40px_rgba(22,22,15,0.5)]"
              style={{
                right: "-4%",
                top: "14%",
                background: "rgba(255,255,255,0.92)",
                animation: "mf-rise 1s var(--ease-out-quint) 1s both",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.6rem] font-medium tracking-[0.09em] uppercase text-muted">
                  Ward 02 — steady
                </span>
                <span className="size-[6px] shrink-0 rounded-full bg-sage a-blip" />
              </div>
              <div className="mt-[0.4rem] h-[2.1rem] overflow-hidden text-sage">
                <div className="w-[200%] h-full a-trace-run">
                  <svg
                    viewBox="0 0 800 60"
                    preserveAspectRatio="none"
                    fill="none"
                    className="w-full h-full block"
                  >
                    <path
                      d="M0,34 L28,34 L36,20 L44,50 L52,34 L86,34 L94,28 L102,34 L140,34 L160,34 L168,20 L176,50 L184,34 L218,34 L226,28 L234,34 L272,34 L292,34 L300,20 L308,50 L316,34 L350,34 L358,28 L366,34 L400,34 L428,34 L436,20 L444,50 L452,34 L486,34 L494,28 L502,34 L540,34 L560,34 L568,20 L576,50 L584,34 L618,34 L626,28 L634,34 L672,34 L692,34 L700,20 L708,50 L716,34 L750,34 L758,28 L766,34 L800,34"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* floating cross badge */}
            <div
              className="absolute size-[2.75rem] rounded-full grid place-items-center bg-clay-tint text-clay border border-clay/15 shadow-[0_10px_24px_-14px_rgba(22,22,15,0.35)]"
              style={{
                left: "-2%",
                bottom: "24%",
                animation: "mf-float-soft 7s ease-in-out -2s infinite",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <blockquote
          className="absolute bottom-10 left-10 right-10"
          style={{ animation: "mf-rise 1s var(--ease-out-quint) 1.2s both" }}
        >
          <p className="u-serif text-[1.28rem] leading-[1.35] text-sage-deep max-w-sm">
            Every medicine, every order, reconciled the moment it moves.
          </p>
        </blockquote>
      </aside>
    </div>
  );
}
