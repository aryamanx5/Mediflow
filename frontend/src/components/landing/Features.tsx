import { useReveal } from "../../hooks/useReveal";
import { cn } from "../../lib/cn";
import { DispensaryShelf } from "./DispensaryShelf";

/**
 * Every claim below maps to a field or behaviour that exists in the backend.
 * Nothing here describes a capability the API cannot serve.
 */
const SECTIONS = [
  {
    id: "inventory",
    index: "01",
    title: "Inventory that knows its own floor",
    body: "Each product carries an SKU, category, brand and supplier, a cost and a selling price, a unit, and — the part that matters — a stock quantity alongside the minimum you are willing to hold. When the first drops below the second, the product says so.",
    points: [
      "Search by product name or SKU",
      "Filter by category or brand",
      "Cost and selling price held separately",
      "Reorder floor per product, not per shop",
    ],
    visual: "stock",
  },
  {
    id: "customers",
    index: "02",
    title: "Customers, on file rather than in memory",
    body: "A customer record holds who they are and where the order goes: name, age, gender, phone, email, an optional GST number, and a full address down to landmark and pin code. Typed once, reused on every order.",
    points: [
      "Search by name, customer ID or phone",
      "Home, work or other delivery address",
      "GST number for business buyers",
      "Complete address, landmark to pin code",
    ],
    visual: "customer",
  },
  {
    id: "orders",
    index: "03",
    title: "Orders that settle the stock as they are placed",
    body: "An order is checked against live inventory before it exists. Every line is verified, stock is decremented, and the bill is computed — subtotal, 18% GST, discount, shipping — inside a single database transaction. If any line fails, none of it happened.",
    points: [
      "Stock verified line by line before commit",
      "Subtotal, GST, discount and shipping computed once",
      "Cash, UPI, card or net banking",
      "Cancelling an order returns its stock",
    ],
    visual: "order",
  },
];

export function Features() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} id="platform">
      {SECTIONS.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={cn(
            "relative overflow-hidden border-t border-line py-24 sm:py-32",
            i % 2 === 0 ? "bg-paper-warm" : "bg-paper",
          )}
        >
          {/* the shelf belongs to inventory only — it is the section that is
              literally about what is on the shelf */}
          {s.id === "inventory" && <DispensaryShelf />}

          <div className="relative mx-auto max-w-[86rem] px-5 sm:px-8">
            <div
              className={cn(
                "grid lg:grid-cols-12 gap-y-12 gap-x-14 items-center",
                i % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className="lg:col-span-5">
                <p className="u-eyebrow reveal">
                  <span className="font-mono">{s.index}</span> — {s.id}
                </p>
                <h2
                  className="u-display text-[clamp(1.8rem,3.9vw,2.85rem)] mt-4 reveal"
                  style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
                >
                  {s.title}
                </h2>
                <p
                  className="mt-5 text-[1.0rem] leading-relaxed text-ink-soft max-w-md reveal"
                  style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
                >
                  {s.body}
                </p>
                <ul className="mt-7 space-y-2.5">
                  {s.points.map((p, j) => (
                    <li
                      key={p}
                      className="reveal flex items-baseline gap-3 text-[0.9rem] text-ink-soft"
                      style={{ "--reveal-delay": `${200 + j * 60}ms` } as React.CSSProperties}
                    >
                      <span aria-hidden className="text-sage shrink-0">
                        &mdash;
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="lg:col-span-7 reveal"
                style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
              >
                <Visual kind={s.visual} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/* --- illustrative panels ------------------------------------------------
   These are static compositions on the landing page, drawn in the same visual
   language as the real screens. The live figures appear once you are inside.
   ----------------------------------------------------------------------- */

function Panel({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="bg-panel border border-line rounded-xl overflow-hidden shadow-[0_28px_60px_-40px_rgba(22,22,15,0.35)]">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-line-soft bg-paper-warm/60">
        <span aria-hidden className="size-2 rounded-full bg-line" />
        <span aria-hidden className="size-2 rounded-full bg-line" />
        <span className="u-label ml-2 text-[0.62rem]">{label}</span>
        <span className="u-meta ml-auto text-[0.62rem] tracking-wide">Sample data</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </figure>
  );
}

function Visual({ kind }: { kind: string }) {
  if (kind === "stock") {
    // Illustrative only — invented SKUs, deliberately not the live catalogue.
    const rows = [
      ["Paracetamol 500mg", "SAMPLE-01", 148, 25],
      ["Antiseptic Solution", "SAMPLE-02", 36, 30],
      ["Oral Rehydration Salts", "SAMPLE-03", 14, 40],
      ["Cough Linctus", "SAMPLE-04", 0, 20],
    ] as const;
    return (
      <Panel label="Inventory">
        <div className="space-y-3">
          {rows.map(([name, sku, qty, min]) => {
            const pct = Math.min(100, (qty / Math.max(min * 3, 1)) * 100);
            const tone =
              qty === 0 ? "bg-danger" : qty <= min ? "bg-warn" : "bg-sage";
            return (
              <div key={sku}>
                <div className="flex items-baseline justify-between gap-4 mb-1.5">
                  <span className="text-[0.88rem]">{name}</span>
                  <span className="u-meta font-mono text-[0.75rem]">
                    {qty} / min {min}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
                  <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    );
  }

  if (kind === "customer") {
    return (
      <Panel label="Customer record">
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {[
            ["Customer ID", "SAMPLE-1001"],
            ["Name", "A. Example"],
            ["Phone", "00000 00000"],
            ["Email", "customer@example.com"],
            ["GST number", "00AAAAA0000A1Z0"],
            ["Address type", "Home"],
            ["Address", "1 Example Street"],
            ["City", "Sample City — 000000"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="u-label text-[0.62rem]">{k}</p>
              <p className="text-[0.88rem] mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel label="Order SAMPLE-0001">
      <div className="space-y-2.5">
        {[
          ["Antacid Suspension", 5, 310],
          ["Vitamin C Tablets", 21, 40],
          ["Paracetamol 650mg", 20, 35],
        ].map(([n, q, p]) => (
          <div key={String(n)} className="flex justify-between gap-4 text-[0.88rem]">
            <span className="text-ink-soft">
              {n} <span className="text-faint">× {q}</span>
            </span>
            <span className="font-mono text-[0.82rem]">₹{Number(p) * Number(q)}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-line-soft space-y-2 text-[0.85rem]">
        {[
          ["Subtotal", "₹3,510.00"],
          ["GST (18%)", "₹631.80"],
          ["Discount", "−₹100.00"],
          ["Shipping", "₹75.00"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-muted">
            <span>{k}</span>
            <span className="font-mono text-[0.8rem]">{v}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2.5 border-t border-line-soft text-ink font-medium">
          <span>Total</span>
          <span className="font-mono">₹4,116.80</span>
        </div>
      </div>
    </Panel>
  );
}
