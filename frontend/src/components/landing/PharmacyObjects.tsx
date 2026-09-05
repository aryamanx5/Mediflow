import { useEffect, useRef } from "react";
import type { Pointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Four pharmacy objects at two depths, tracking the cursor as a camera would:
 * the nearer pair travels further and settles faster than the far pair.
 *
 * These replace an earlier three.js scene. The design calls for four matte
 * shapes at two parallax depths, which is a handful of divs — pulling in a
 * WebGL renderer (and ~885KB of chunk) to draw them was the wrong trade.
 *
 * Transforms are written straight to the DOM from the shared pointer ref;
 * routing per-frame pointer values through React state would re-render the
 * hero on every mouse move for no benefit.
 */
export function PharmacyObjects({ pointer }: { pointer: React.RefObject<Pointer> }) {
  const nearRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const tick = () => {
      const { x, y } = pointer.current;
      if (nearRef.current) {
        nearRef.current.style.transform = `translate3d(${x * 18}px, ${y * 14}px, 0)`;
      }
      if (farRef.current) {
        farRef.current.style.transform = `translate3d(${x * 9}px, ${y * 7}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pointer, reduced]);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {/* near pair — larger travel, quicker settle */}
      <div
        ref={nearRef}
        className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {/* capsule */}
        <div
          className="absolute w-[46px] h-24 rounded-full overflow-hidden shadow-[0_18px_30px_-22px_rgba(22,22,15,0.5)]"
          style={{ right: "7%", top: "9%", transform: "rotate(28deg)", animation: "mf-float-soft 7.5s ease-in-out infinite" }}
        >
          <div className="h-1/2" style={{ background: "#9c6b4f" }} />
          <div className="h-1/2" style={{ background: "#efece4" }} />
        </div>

        {/* first-aid box */}
        <div
          className="absolute w-16 h-[34px] rounded-md grid place-items-center shadow-[0_18px_30px_-22px_rgba(22,22,15,0.5)]"
          style={{ right: "9%", bottom: "5%", background: "#4f6152", transform: "rotate(-9deg)", animation: "mf-float-soft 8.4s ease-in-out -3s infinite" }}
        >
          <div className="relative size-[14px]">
            <div className="absolute left-[5.5px] top-0 w-[3px] h-[14px]" style={{ background: "#efece4" }} />
            <div className="absolute top-[5.5px] left-0 h-[3px] w-[14px]" style={{ background: "#efece4" }} />
          </div>
        </div>
      </div>

      {/* far pair — smaller travel, slower settle */}
      <div
        ref={farRef}
        className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {/* vial */}
        <div
          className="absolute w-11 h-[70px] rounded-lg border shadow-[0_16px_26px_-20px_rgba(22,22,15,0.45)]"
          style={{
            left: "66%",
            top: "12%",
            background:
              "linear-gradient(180deg, rgba(207,216,207,0.75) 0%, rgba(207,216,207,0.55) 38%, #7d907f 39%, #7d907f 100%)",
            borderColor: "rgba(79,97,82,0.25)",
            animation: "mf-float-soft 9s ease-in-out -5s infinite",
          }}
        >
          <div
            className="absolute left-1/2 -top-[9px] -translate-x-1/2 w-5 h-[11px] rounded-[3px]"
            style={{ background: "#4f6152" }}
          />
        </div>

        {/* tablet */}
        <div
          className="absolute size-9 rounded-full grid place-items-center shadow-[0_14px_24px_-18px_rgba(22,22,15,0.45)]"
          style={{
            right: "16%",
            top: "16%",
            background: "#efece4",
            border: "1px solid rgba(22,22,15,0.12)",
            animation: "mf-float-soft 6.6s ease-in-out -1.5s infinite",
          }}
        >
          <div className="w-0.5 h-[22px] opacity-55" style={{ background: "#16160f" }} />
        </div>
      </div>
    </div>
  );
}
