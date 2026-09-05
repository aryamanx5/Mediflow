import type { ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-16 px-6 text-center">
      <div
        aria-hidden
        className="mx-auto mb-5 size-11 rounded-full border border-line grid place-items-center text-faint"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="4" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 8h16" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
      <p className="u-serif text-[1.15rem] mb-1.5">{title}</p>
      <p className="u-meta max-w-sm mx-auto">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="py-14 px-6 text-center" role="alert">
      <p className="u-serif text-[1.1rem] mb-1.5 text-danger">Couldn&rsquo;t load this</p>
      <p className="u-meta max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Row-shaped shimmer that matches the real table's column count. */
export function SkeletonRows({ rows = 6, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-line-soft">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="skeleton h-3"
                style={{ width: `${45 + ((r * 7 + c * 13) % 40)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonLines({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton h-3.5" style={{ width: `${55 + ((i * 17) % 40)}%` }} />
      ))}
    </div>
  );
}
