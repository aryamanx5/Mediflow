import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap " +
  "transition-[background-color,color,border-color,opacity] duration-200 " +
  "disabled:opacity-45 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-sage rounded-full",
  secondary:
    "bg-transparent text-ink border border-line hover:border-ink hover:bg-paper-warm rounded-full",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-paper-warm rounded-md",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger hover:text-paper hover:border-danger rounded-full",
  link: "text-sage underline underline-offset-4 decoration-sage/35 hover:decoration-sage p-0",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.78rem] px-3.5 h-8",
  md: "text-[0.85rem] px-5 h-10",
  lg: "text-[0.92rem] px-7 h-12",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], variant !== "link" && sizes[size], className)}
    >
      {loading ? (
        <span
          aria-hidden
          className="a-spin size-3.5 rounded-full border-[1.5px] border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
