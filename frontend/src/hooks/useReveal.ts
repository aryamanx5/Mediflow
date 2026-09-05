import { useEffect, useRef } from "react";

/**
 * Adds `.is-in` to elements carrying `.reveal` once they enter the viewport.
 * One observer per container, disconnected after everything has revealed, so
 * nothing keeps running after the section has been seen.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = "0px 0px -8% 0px" } = options;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    let remaining = targets.length;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
          if (--remaining === 0) {
            observer.disconnect();
            clearTimeout(safety);
          }
        }
      },
      { threshold, rootMargin },
    );

    targets.forEach((el) => observer.observe(el));

    // Safety net. These elements start at opacity 0, so anything that stops
    // the observer from ever firing — a background tab, an unusual embedding,
    // a browser quirk — would otherwise hide this content permanently. Text is
    // never worth withholding for the sake of an entrance animation.
    const safety = window.setTimeout(() => {
      targets.forEach((el) => el.classList.add("is-in"));
      observer.disconnect();
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [threshold, rootMargin]);

  return ref;
}
