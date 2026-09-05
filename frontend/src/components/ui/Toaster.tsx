import { useToast, type ToastKind } from "../../hooks/useToast";
import { cn } from "../../lib/cn";

const tones: Record<ToastKind, string> = {
  success: "border-l-ok",
  error: "border-l-danger",
  info: "border-l-info",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed bottom-5 right-5 z-200 flex flex-col gap-2 w-[min(22rem,calc(100vw-2.5rem))]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={cn(
            "a-rise flex items-start gap-3 surface-overlay border border-l-2 rounded-md",
            "px-4 py-3 text-[0.84rem] shadow-[0_12px_32px_-12px_rgba(22,22,15,0.28)]",
            tones[t.kind],
          )}
        >
          <span className="grow">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 -mr-1 -mt-0.5 size-6 grid place-items-center rounded text-faint hover:text-ink transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
