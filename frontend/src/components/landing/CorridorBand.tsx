import { useEffect, useRef } from "react";
import { CORRIDOR_SRC } from "../../assets/corridor/config";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useReveal } from "../../hooks/useReveal";

/**
 * The breath between the problem and the product: a full-bleed corridor,
 * scroll-zoomed, with the page's one moment of light type on a dark ground.
 *
 * The reference drives the zoom with `animation-timeline: view()`, which only
 * a subset of browsers implement — the same effect is computed here from the
 * section's own position instead, so it behaves identically everywhere and
 * costs one rAF loop that only runs while the band is on screen.
 */
export function CorridorBand() {
  const revealRef = useReveal<HTMLElement>();
  const photoRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const photo = photoRef.current;
    const section = revealRef.current;
    if (!photo || !section || reduced) return;

    let frame = 0;
    let visible = true;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the band enters from below, 1 as it leaves past the top.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      // Matches mf-scroll-zoom: a push in from 1.28 to 1.06 while panning
      // down, so the corridor recedes as the reader passes through it.
      photo.style.transform =
        `scale(${(1.28 - p * 0.22).toFixed(4)}) translateY(${(-3 + p * 6).toFixed(2)}%)`;
      frame = visible ? requestAnimationFrame(tick) : 0;
    };

    // Only spend frames while the band is actually in view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(tick);
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(section);
    frame = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [revealRef, reduced]);

  return (
    <section
      ref={revealRef}
      className="relative h-[62svh] min-h-[22rem] overflow-hidden border-t border-line bg-[#eae7de]"
      aria-label="Where the stock actually goes"
    >
      {CORRIDOR_SRC ? (
        <img
          ref={photoRef}
          src={CORRIDOR_SRC}
          alt="A hospital corridor"
          loading="lazy"
          decoding="async"
          className="absolute -inset-[8%] w-[116%] h-[116%] object-cover will-change-transform"
          style={{ filter: "blur(3px) saturate(0.92)" }}
        />
      ) : (
        // Same composition, no photo: the band still has to read as a place.
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #dfe6df 0%, #e9ede6 34%, #b9c3bb 72%, #8d9a90 100%)",
          }}
        />
      )}

      {/* wash — paper at the top, ink at the bottom, so the type below has a
          ground dark enough to sit on whatever the photo is doing */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,244,239,0.55) 0%, rgba(246,244,239,0.12) 35%, rgba(22,22,15,0.35) 100%)",
        }}
      />

      {/* the same ward light that crosses the auth panel, a little quicker */}
      <div
        aria-hidden
        className="absolute -top-[20%] -bottom-[20%] w-[20%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "soft-light",
          animation: "mf-beam 19s linear infinite",
        }}
      />

      {/* scrim under the type only. The wash above is tuned to keep the room
          readable, which leaves the corridor's bright far end sitting right
          where the eyebrow falls — this puts a ground under the text without
          darkening the whole frame. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "linear-gradient(180deg, rgba(22,22,15,0) 0%, rgba(22,22,15,0.28) 55%, rgba(22,22,15,0.52) 100%)",
        }}
      />

      <div className="absolute inset-0 mx-auto flex max-w-[86rem] flex-col justify-end px-5 py-14 sm:px-8">
        {/* .u-eyebrow sets its own sage colour and wins over a text-* utility,
            so the override has to be inline to land on a photo. */}
        <p className="u-eyebrow reveal" style={{ color: "var(--color-paper)" }}>
          Where the stock actually goes
        </p>
        <p
          className="u-serif reveal mt-3 max-w-[34rem] text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.1] text-paper"
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          Dispensary, ward and delivery — one ledger behind all three.
        </p>
      </div>
    </section>
  );
}
