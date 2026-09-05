import { useCallback, useState } from "react";
import { Drawer } from "./ui/Drawer";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { ErrorState, SkeletonLines } from "./ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "./ui/Badge";
import { useResource } from "../hooks/useResource";
import { orders } from "../services/api";
import { dateTime, money } from "../lib/format";
import type { Customer } from "../services/types";

/**
 * Detail is fetched by id rather than reused from the list row: only the
 * detail route populates the full customer and product documents.
 */
export function OrderDetail({
  orderId,
  onClose,
  onCancelled,
}: {
  orderId: string | null;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(
    (signal: AbortSignal) => {
      if (!orderId) return Promise.reject(new Error("no order"));
      return orders.get(orderId, signal);
    },
    [orderId],
  );

  const { data, loading, error, refresh } = useResource(load, [orderId]);
  const order = data?.data;

  const cancel = async () => {
    if (!orderId) return;
    await orders.cancel(orderId);
    onCancelled();
    refresh();
  };

  const customer = order?.customer as Customer | null | undefined;

  return (
    <>
      <Drawer
        open={orderId !== null}
        onClose={onClose}
        title={order ? order.orderNumber : "Order"}
      >
        {loading ? (
          <SkeletonLines lines={9} />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : order ? (
          <div className="space-y-7">
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            <section>
              <p className="u-label border-b border-line-soft pb-2 mb-3">Customer</p>
              {customer ? (
                <div className="space-y-1">
                  <p className="text-[0.95rem] font-medium">{customer.customerName}</p>
                  <p className="u-meta font-mono text-[0.74rem]">{customer.customerId}</p>
                  {customer.phone && <p className="u-meta">{customer.phone}</p>}
                  {customer.addressLine1 && (
                    <p className="u-meta leading-relaxed pt-1">
                      {[
                        customer.addressLine1,
                        customer.addressLine2,
                        customer.landmark,
                        customer.city,
                        customer.state,
                        customer.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="u-meta">This customer record has been removed.</p>
              )}
            </section>

            <section>
              <p className="u-label border-b border-line-soft pb-2 mb-3">Items</p>
              <ul className="space-y-3">
                {order.items.map((item, i) => (
                  <li key={item._id ?? i} className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[0.88rem]">
                        {item.product?.productName ?? "Product removed"}
                      </p>
                      <p className="u-meta text-[0.72rem]">
                        {item.product?.sku ? `${item.product.sku} · ` : ""}
                        {item.quantity} × {money(item.price)}
                      </p>
                    </div>
                    <span className="text-[0.88rem] tabular shrink-0">
                      {money(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <p className="u-label border-b border-line-soft pb-2 mb-3">Bill</p>
              <div className="space-y-2 text-[0.86rem]">
                <Line label="Subtotal" value={money(order.subtotal)} />
                <Line label="GST" value={money(order.gst)} />
                <Line label="Discount" value={`− ${money(order.discount)}`} />
                <Line label="Shipping" value={money(order.shippingCharge)} />
                <div className="flex justify-between pt-2.5 border-t border-line font-medium">
                  <span>Total</span>
                  <span className="tabular">{money(order.totalAmount)}</span>
                </div>
              </div>
            </section>

            <section>
              <p className="u-label border-b border-line-soft pb-2 mb-3">Record</p>
              <div className="space-y-2 text-[0.86rem]">
                <Line label="Payment method" value={order.paymentMethod} />
                <Line label="Placed" value={dateTime(order.createdAt)} />
                <Line label="Last updated" value={dateTime(order.updatedAt)} />
              </div>
            </section>

            {order.orderStatus !== "Cancelled" && (
              <div className="pt-2 border-t border-line-soft">
                <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
                  Cancel this order
                </Button>
                <p className="u-meta mt-2">
                  Cancelling returns every item on this order to stock.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={confirming}
        title="Cancel this order?"
        body={`${order?.orderNumber ?? "This order"} will be marked cancelled and every item on it returned to stock. This cannot be undone.`}
        confirmLabel="Cancel order"
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="tabular text-right">{value}</span>
    </div>
  );
}
