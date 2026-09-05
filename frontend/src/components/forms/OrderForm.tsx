import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldRow, SelectField, TextField } from "../ui/Field";
import { SkeletonLines } from "../ui/States";
import { customers as customersApi, products as productsApi, type OrderInput } from "../../services/api";
import { ApiError } from "../../services/client";
import { money } from "../../lib/format";
import type { Customer, PaymentMethod, Product } from "../../services/types";

/** Matches utils/orderUtils.js — shown as a preview, still computed server-side. */
const GST_RATE = 0.18;

interface Line {
  key: number;
  productId: string;
  quantity: number;
}

export function OrderForm({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: OrderInput) => Promise<void>;
}) {
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [directory, setDirectory] = useState<Customer[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [discount, setDiscount] = useState("0");
  const [shipping, setShipping] = useState("0");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reference data is only needed while the dialog is open.
  useEffect(() => {
    if (!open) return;

    setCustomerId("");
    setLines([{ key: 1, productId: "", quantity: 1 }]);
    setPaymentMethod("Cash");
    setDiscount("0");
    setShipping("0");
    setError(null);
    setRefError(null);
    setLoadingRefs(true);

    const controller = new AbortController();
    Promise.all([
      customersApi.list({ limit: 200 }, controller.signal),
      productsApi.list({ limit: 200 }, controller.signal),
    ])
      .then(([c, p]) => {
        setDirectory(c.data);
        setCatalogue(p.data);
        setCustomerId(c.data[0]?._id ?? "");
        setLines([{ key: 1, productId: p.data[0]?._id ?? "", quantity: 1 }]);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setRefError(
          err instanceof ApiError ? err.message : "Couldn't load customers and products.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingRefs(false);
      });

    return () => controller.abort();
  }, [open]);

  const productById = useMemo(
    () => new Map(catalogue.map((p) => [p._id, p])),
    [catalogue],
  );

  const addLine = () =>
    setLines((ls) => [
      ...ls,
      { key: Math.max(0, ...ls.map((l) => l.key)) + 1, productId: catalogue[0]?._id ?? "", quantity: 1 },
    ]);

  const removeLine = (key: number) =>
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.key !== key)));

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  /* --- totals preview, and the stock check the backend will also run --- */

  const summary = useMemo(() => {
    let subtotal = 0;
    const shortfalls: string[] = [];

    for (const line of lines) {
      const p = productById.get(line.productId);
      if (!p) continue;
      subtotal += p.sellingPrice * line.quantity;
      if (line.quantity > p.stockQuantity) {
        shortfalls.push(
          `${p.productName} — ${p.stockQuantity} ${p.unit} in stock, ${line.quantity} requested`,
        );
      }
    }

    const gst = Number((subtotal * GST_RATE).toFixed(2));
    const total = Number(
      (subtotal + gst + Number(shipping || 0) - Number(discount || 0)).toFixed(2),
    );
    return { subtotal, gst, total, shortfalls };
  }, [lines, productById, discount, shipping]);

  const hasEmptyLine = lines.some((l) => !l.productId);
  const canSubmit =
    !loadingRefs &&
    Boolean(customerId) &&
    lines.length > 0 &&
    !hasEmptyLine &&
    summary.shortfalls.length === 0;

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        await onSubmit({
          customerId,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          paymentMethod,
          discount: Number(discount) || 0,
          shippingCharge: Number(shipping) || 0,
        });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't place the order.");
      } finally {
        setBusy(false);
      }
    },
    [customerId, lines, paymentMethod, discount, shipping, onSubmit],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="New order"
      description="Stock is verified again on the server before the order is committed."
    >
      {loadingRefs ? (
        <SkeletonLines lines={7} />
      ) : refError ? (
        <p role="alert" className="text-[0.88rem] text-danger">
          {refError}
        </p>
      ) : directory.length === 0 || catalogue.length === 0 ? (
        <p className="text-[0.9rem] text-ink-soft">
          {directory.length === 0
            ? "Add a customer before placing an order."
            : "Add a product before placing an order."}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-7" noValidate>
          <SelectField
            label="Customer"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={directory.map((c) => ({
              value: c._id,
              label: `${c.customerName} — ${c.customerId}`,
            }))}
          />

          <section>
            <p className="u-label border-b border-line-soft pb-2 mb-4">Items</p>
            <ul className="space-y-3">
              {lines.map((line) => {
                const p = productById.get(line.productId);
                const short = p ? line.quantity > p.stockQuantity : false;
                return (
                  <li key={line.key} className="flex items-end gap-3">
                    <div className="grow min-w-0">
                      <SelectField
                        label="Product"
                        value={line.productId}
                        onChange={(e) => updateLine(line.key, { productId: e.target.value })}
                        options={catalogue.map((c) => ({
                          value: c._id,
                          label: `${c.productName} — ${money(c.sellingPrice)} (${c.stockQuantity} ${c.unit})`,
                        }))}
                      />
                    </div>
                    <div className="w-24 shrink-0">
                      <TextField
                        label="Qty"
                        type="number"
                        min={1}
                        value={String(line.quantity)}
                        onChange={(e) =>
                          updateLine(line.key, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        error={short ? " " : undefined}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                      aria-label="Remove this item"
                      className="shrink-0 size-9 mb-0.5 grid place-items-center rounded-md text-faint hover:text-danger hover:bg-danger-tint transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={addLine}>
              Add item
            </Button>

            {summary.shortfalls.length > 0 && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-warn/30 bg-warn-tint px-4 py-3 text-[0.82rem] text-warn"
              >
                <p className="font-medium mb-1">Not enough stock</p>
                <ul className="space-y-0.5">
                  {summary.shortfalls.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <p className="u-label border-b border-line-soft pb-2">Billing</p>
            <FieldRow cols={3}>
              <SelectField
                label="Payment method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={["Cash", "UPI", "Card", "Net Banking"].map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
              <TextField
                label="Discount"
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <TextField
                label="Shipping charge"
                type="number"
                min={0}
                step="0.01"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
              />
            </FieldRow>
          </section>

          <div className="bg-paper-warm border border-line rounded-lg px-5 py-4 space-y-2 text-[0.86rem]">
            <Row label="Subtotal" value={money(summary.subtotal)} />
            <Row label="GST (18%)" value={money(summary.gst)} />
            <Row label="Discount" value={`− ${money(Number(discount) || 0)}`} />
            <Row label="Shipping" value={money(Number(shipping) || 0)} />
            <div className="flex justify-between pt-2.5 border-t border-line font-medium text-ink">
              <span>Total</span>
              <span className="tabular">{money(summary.total)}</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[0.85rem] text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy} disabled={!canSubmit}>
              Place order
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}
