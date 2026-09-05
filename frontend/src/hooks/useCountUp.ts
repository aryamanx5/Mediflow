import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Tweens a number up to `to` the first time the element is scrolled into view.
 *
 * The returned value starts at the final number rather than zero, and is only
 * wound back once we know the tween can actually run: if the observer never
 * fires, or motion is reduced, the correct figure is what's on screen. A stat
 * that reads "0" because an animation didn't start is worse than no animation.
 */
export function useCountUp<T extends HTMLElement>(to: number, durationMs = 1500) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(to);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !("IntersectionObserver" in window)) return;

    let frame = 0;
    let started = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        io.disconnect();

        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / durationMs);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(to * eased));
          if (p < 1) frame = requestAnimationFrame(step);
        };
        setValue(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, durationMs, reduced]);

  return { ref, value };
}
