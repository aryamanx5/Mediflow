import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Wider layout for multi-column forms. */
  size?: "md" | "lg";
}

/**
 * Dialog with the accessibility behaviour users expect: Escape closes, focus
 * moves in on open and returns on close, Tab is trapped, and the page behind
 * does not scroll.
 */
export function Modal({ open, onClose, title, description, children, size = "md" }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] a-fade"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full surface-overlay border shadow-[0_24px_70px_-20px_rgba(22,22,15,0.32)]",
          "rounded-t-xl sm:rounded-lg max-h-[92vh] sm:max-h-[86vh] flex flex-col a-rise",
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <header className="flex items-start justify-between gap-6 px-6 sm:px-8 pt-6 pb-4 border-b border-line-soft shrink-0">
          <div>
            <h2 className="u-serif text-[1.4rem] leading-tight">{title}</h2>
            {description && <p className="u-meta mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 -mt-1 -mr-2 size-9 grid place-items-center rounded-full text-muted hover:text-ink hover:bg-paper-warm transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden fill="none">
              <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>
        <div className="overflow-y-auto px-6 sm:px-8 py-6">{children}</div>
      </div>
    </div>
  );
}
