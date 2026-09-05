import { cn } from "../../lib/cn";
import type { OrderStatus, PaymentStatus } from "../../services/types";
import type { StockLevel } from "../../lib/stock";

type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  danger: "bg-danger-tint text-danger",
  info: "bg-info-tint text-info",
  neutral: "bg-paper-warm text-muted",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "text-[0.7rem] font-medium tracking-wide whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

/* The tone maps below cover exactly the enum values in the Mongoose schemas.
   No status is displayed that the backend cannot produce. */

const orderTones: Record<OrderStatus, Tone> = {
  Pending: "warn",
  Confirmed: "info",
  Packed: "info",
  Shipped: "info",
  Delivered: "ok",
  Cancelled: "danger",
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={orderTones[status] ?? "neutral"}>{status}</Badge>
);

const paymentTones: Record<PaymentStatus, Tone> = {
  Pending: "warn",
  Paid: "ok",
  Failed: "danger",
};

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentTones[status] ?? "neutral"}>{status}</Badge>
);

const stockTones: Record<StockLevel, Tone> = {
  out: "danger",
  low: "warn",
  ok: "ok",
};

export const StockBadge = ({ level, children }: { level: StockLevel; children: React.ReactNode }) => (
  <Badge tone={stockTones[level]}>{children}</Badge>
);
