import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Reveals `text` one character at a time. Under reduced-motion the full
 * string is shown immediately — the content is never withheld.
 */
export function useTypewriter(text: string, speed = 34, startDelay = 500) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduced ? text : "");
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);

    let index = 0;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay, reduced]);

  return { displayed, done };
}
