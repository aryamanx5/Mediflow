import { cn } from "../lib/cn";

/**
 * MediFlow mark: the stethoscope bell from the original brand, redrawn as a
 * continuous line that closes into a circle — one instrument, one loop.
 */
export function Logo({ className, size = 26 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8 3v6.2a6 6 0 0 0 12 0V3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M14 15.2v3.1a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="23" cy="21.4" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="2.6" r="1.5" fill="currentColor" />
      <circle cx="20" cy="2.6" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo className="text-sage" />
      <span className="u-serif text-[1.32rem] leading-none tracking-[-0.02em]">
        MediFlow
      </span>
    </span>
  );
}
