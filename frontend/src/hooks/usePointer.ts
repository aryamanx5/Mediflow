import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface Pointer {
  /** Normalised to -1..1 around the viewport centre. */
  x: number;
  y: number;
}

/**
 * A single window-level pointer listener shared by every parallax consumer,
 * sampled inside one rAF loop with critically-damped smoothing.
 *
 * Values are written into a ref rather than state: this updates every frame
 * and must never trigger a React render.
 */
export function usePointer(smoothing = 0.08) {
  const target = useRef<Pointer>({ x: 0, y: 0 });
  const value = useRef<Pointer>({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      target.current = { x: 0, y: 0 };
      value.current = { x: 0, y: 0 };
      return;
    }

    // Coarse pointers (touch) have no hover position to track.
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };

    // When the cursor leaves, ease back to centre rather than freezing.
    const onLeave = () => {
      target.current = { x: 0, y: 0 };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let frame = 0;
    const tick = () => {
      value.current.x += (target.current.x - value.current.x) * smoothing;
      value.current.y += (target.current.y - value.current.y) * smoothing;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [smoothing, reduced]);

  return value;
}
