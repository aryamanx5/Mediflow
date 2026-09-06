import { useEffect, useRef, type ReactNode } from "react";

/** Right-hand detail panel. Same focus/escape contract as Modal. */
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/45 a-fade" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{ animation: "mf-rise 0.45s var(--ease-out-quint) both" }}
        className="relative w-full sm:max-w-md surface-overlay border-l h-full flex flex-col outline-none shadow-[-24px_0_70px_-30px_rgba(22,22,15,0.35)]"
      >
        <header className="flex items-center justify-between gap-4 px-6 py-5 border-b border-line-soft shrink-0">
          <h2 className="u-serif text-[1.3rem]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="size-9 grid place-items-center rounded-full text-muted hover:text-ink hover:bg-paper-warm transition-colors -mr-2"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden fill="none">
              <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>
        <div className="overflow-y-auto grow px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
