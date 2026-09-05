import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route changes should start at the top of the page — but not when the URL
 * carries a hash, which is the landing page's own in-page navigation.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
