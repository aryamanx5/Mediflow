import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Tables scroll inside their own container so the page never scrolls
 * sideways on narrow screens.
 */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="surface surface-table rounded-lg overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "u-label font-semibold px-3 py-3 border-b whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-3.5 text-[0.86rem] align-middle",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  label?: string;
}) {
  if (!onClick) return <tr className="border-b last:border-0">{children}</tr>;

  // A clickable row must also be reachable and activatable from the keyboard.
  return (
    <tr
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="surface-row-hover border-b last:border-0 cursor-pointer transition-colors focus-visible:bg-white/25"
    >
      {children}
    </tr>
  );
}
