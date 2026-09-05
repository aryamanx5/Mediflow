import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoxIcon, Page, PageHeader, PersonIcon, ReceiptIcon } from "../layouts/AppLayout";
import { useResource } from "../hooks/useResource";
import { useAuth } from "../hooks/useAuth";
import { customers, orders, products } from "../services/api";
import { stockLabel, stockLevel } from "../lib/stock";
import { money, relative } from "../lib/format";
import { StockBadge, OrderStatusBadge } from "../components/ui/Badge";
import { ErrorState, SkeletonLines } from "../components/ui/States";
import type { Product } from "../services/types";

/**
 * Every figure on this page is read from an endpoint that exists. The backend
 * has no analytics route, so totals come from the list endpoints' `total` and
 * the stock signal is derived from stockQuantity vs minimumStock. Nothing is
 * estimated or invented.
 */
export default function Overview() {
  const { user } = useAuth();

  const load = useCallback(async (signal: AbortSignal) => {
    const [p, c, o, stock, recent] = await Promise.all([
      products.list({ limit: 1 }, signal),
      customers.list({ limit: 1 }, signal),
      orders.list({ limit: 1 }, signal),
      // A single page wide enough to compute the stock signal without
      // dragging the whole catalogue down.
      products.list({ limit: 200 }, signal),
      orders.list({ limit: 5 }, signal),
    ]);
    return {
      productCount: p.total,
      customerCount: c.total,
      orderCount: o.total,
      catalogue: stock.data,
      recentOrders: recent.data,
    };
  }, []);

  const { data, loading, error, refresh } = useResource(load, []);

  const attention: Product[] = (data?.catalogue ?? [])
    .filter((p) => stockLevel(p) !== "ok")
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 6);

  const greeting = user?.name ? `Good to see you, ${user.name.split(" ")[0]}.` : undefined;

  return (
    <Page>
      <PageHeader title="Overview" meta={greeting ?? "Today's operational picture."} />

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Stat
              label="Products"
              value={data?.productCount}
              loading={loading}
              to="/app/products"
              icon={BoxIcon}
              tone="sage"
            />
            <Stat
              label="Customers"
              value={data?.customerCount}
              loading={loading}
              to="/app/customers"
              icon={PersonIcon}
              tone="info"
            />
            <Stat
              label="Orders"
              value={data?.orderCount}
              loading={loading}
              to="/app/orders"
              icon={ReceiptIcon}
              tone="clay"
            />
          </div>

          <div className="grid lg:grid-cols-5 gap-5 mt-5">
            {/* stock signal */}
            <section className="lg:col-span-3 surface surface-panel rounded-lg">
              <header className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line-soft">
                <div>
                  <h2 className="text-[0.95rem] font-medium">Needs attention</h2>
                  <p className="u-meta">At or below the reorder floor</p>
                </div>
                <Link to="/app/products" className="u-meta text-sage hover:underline underline-offset-4">
                  All products
                </Link>
              </header>

              {loading ? (
                <div className="p-5">
                  <SkeletonLines lines={4} />
                </div>
              ) : attention.length === 0 ? (
                <p className="px-5 py-10 text-center u-meta">
                  Every product is above its minimum stock.
                </p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {attention.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-[0.88rem] truncate">{p.productName}</p>
                        <p className="u-meta font-mono text-[0.72rem]">
                          {p.sku} · {p.stockQuantity} {p.unit} left, min {p.minimumStock}
                        </p>
                      </div>
                      <StockBadge level={stockLevel(p)}>{stockLabel[stockLevel(p)]}</StockBadge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* quick actions */}
            <section className="lg:col-span-2 surface surface-panel rounded-lg">
              <header className="px-5 py-3.5 border-b border-line-soft">
                <h2 className="text-[0.95rem] font-medium">Quick actions</h2>
              </header>
              <div className="p-5 flex flex-col gap-2">
                <ActionLink to="/app/orders?new=1" label="New order" hint="Bill against live stock" />
                <ActionLink to="/app/products?new=1" label="Add product" hint="SKU, price, stock floor" />
                <ActionLink to="/app/customers?new=1" label="Add customer" hint="Contact and address" />
                <ActionLink to="/app/products" label="View inventory" hint="Search and filter the catalogue" />
              </div>
            </section>
          </div>

          {/* recent orders */}
          <section className="surface surface-panel rounded-lg mt-5">
            <header className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line-soft">
              <h2 className="text-[0.95rem] font-medium">Recent orders</h2>
              <Link to="/app/orders" className="u-meta text-sage hover:underline underline-offset-4">
                All orders
              </Link>
            </header>

            {loading ? (
              <div className="p-5">
                <SkeletonLines lines={4} />
              </div>
            ) : (data?.recentOrders.length ?? 0) === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="u-meta mb-4">No orders placed yet.</p>
                <Link
                  to="/app/orders?new=1"
                  className="inline-flex items-center h-9 px-4 rounded-full border border-line text-[0.82rem] hover:border-ink transition-colors"
                >
                  Place the first one
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {data?.recentOrders.map((o) => (
                  <li key={o._id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[0.88rem] font-mono truncate">{o.orderNumber}</p>
                      <p className="u-meta truncate">
                        {o.customer?.customerName ?? "Customer removed"} · {relative(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[0.86rem] tabular">{money(o.totalAmount)}</span>
                      <OrderStatusBadge status={o.orderStatus} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Page>
  );
}

const STAT_TONE = {
  sage: "bg-sage-tint text-sage",
  info: "bg-info-tint text-info",
  clay: "bg-clay-tint text-clay",
} as const;

function Stat({
  label,
  value,
  loading,
  to,
  icon: Icon,
  tone,
}: {
  label: string;
  value?: number;
  loading: boolean;
  to: string;
  icon: React.ComponentType;
  tone: keyof typeof STAT_TONE;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="text-left surface surface-panel rounded-lg px-5 py-4 hover:border-faint hover:shadow-[0_10px_28px_-18px_rgba(22,22,15,0.35)] transition-[border-color,box-shadow]"
    >
      <div className="flex items-center justify-between">
        <p className="u-label">{label}</p>
        <span
          aria-hidden
          className={`size-7 shrink-0 rounded-full grid place-items-center ${STAT_TONE[tone]}`}
        >
          <Icon />
        </span>
      </div>
      {loading ? (
        <div className="skeleton h-8 w-16 mt-2" />
      ) : (
        <p className="u-serif text-[2.1rem] leading-none mt-2 tabular">{value ?? 0}</p>
      )}
    </button>
  );
}

function ActionLink({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 -mx-2 px-3 py-2.5 rounded-md hover:bg-paper-warm transition-colors"
    >
      <span>
        <span className="block text-[0.88rem]">{label}</span>
        <span className="block u-meta text-[0.74rem]">{hint}</span>
      </span>
      <span aria-hidden className="text-faint group-hover:text-sage transition-colors">
        →
      </span>
    </Link>
  );
}
