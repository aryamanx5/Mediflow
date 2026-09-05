import { cn } from "../../lib/cn";

/**
 * Windowed pager — the original rendered every page as a button, which grows
 * unbounded (20 products at limit 1 produced 20 buttons).
 */
export function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return total > 0 ? (
      <p className="u-meta px-4 py-3">
        {total} {total === 1 ? "record" : "records"}
      </p>
    ) : null;
  }

  const window: (number | "gap")[] = [];
  const push = (n: number | "gap") => window.push(n);
  const near = (n: number) => Math.abs(n - page) <= 1;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || near(i)) push(i);
    else if (window[window.length - 1] !== "gap") push("gap");
  }

  const step = (delta: number) => onChange(Math.min(totalPages, Math.max(1, page + delta)));

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 flex-wrap px-4 py-3 border-t border-line-soft"
    >
      <p className="u-meta">
        Page {page} of {totalPages} · {total} {total === 1 ? "record" : "records"}
      </p>
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => step(-1)} disabled={page === 1} label="Previous page">
          Prev
        </PageBtn>
        {window.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1.5 text-faint" aria-hidden>
              …
            </span>
          ) : (
            <PageBtn
              key={item}
              onClick={() => onChange(item)}
              active={item === page}
              label={`Page ${item}`}
              current={item === page}
            >
              {item}
            </PageBtn>
          ),
        )}
        <PageBtn onClick={() => step(1)} disabled={page === totalPages} label="Next page">
          Next
        </PageBtn>
      </div>
    </nav>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  label,
  current,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
  current?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "min-w-8 h-8 px-2 rounded-md text-[0.8rem] transition-colors",
        "disabled:opacity-35 disabled:pointer-events-none",
        active ? "bg-ink text-paper" : "text-muted hover:text-ink hover:bg-paper-warm",
      )}
    >
      {children}
    </button>
  );
}
