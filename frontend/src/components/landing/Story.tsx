import { useReveal } from "../../hooks/useReveal";

/**
 * The operational problem, told as three states rather than three paragraphs:
 * scattered → counted → reconciled.
 */
const FRAGMENTS = [
  "Stock counted on paper",
  "Prices in a spreadsheet",
  "Orders on WhatsApp",
  "Customers in a notebook",
  "Reorders from memory",
  "GST worked out by hand",
];

/** Per-pill resting angle and phase, so no two settle on the same beat. */
const JITTER = [
  { tilt: -1, dur: "5.5s", delay: "0s" },
  { tilt: 0, dur: "6.2s", delay: "-1s" },
  { tilt: 1, dur: "5.9s", delay: "-2.2s" },
  { tilt: -1, dur: "6.6s", delay: "-3.4s" },
  { tilt: 0, dur: "5.2s", delay: "-4.1s" },
  { tilt: 1, dur: "6.9s", delay: "-2.8s" },
];

export function Story() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="product"
      className="relative border-t border-line bg-paper py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-y-14 gap-x-12">
          <div className="lg:col-span-5">
            <p className="u-eyebrow reveal">The problem</p>
            <h2
              className="u-display text-[clamp(2rem,4.6vw,3.3rem)] mt-4 reveal"
              style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            >
              A pharmacy runs on six
              <br />
              records that never
              <br />
              <em>agree</em> with each other.
            </h2>
            <p
              className="mt-6 text-[1.02rem] leading-relaxed text-ink-soft max-w-md reveal"
              style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
            >
              Every one of them is correct on its own. None of them is correct
              together. The gap between them is where stock quietly disappears
              and orders go out against inventory nobody has.
            </p>
          </div>

          <div className="lg:col-span-7 lg:pl-8">
            {/* scattered */}
            <ul className="flex flex-wrap gap-2.5 mb-10">
              {FRAGMENTS.map((f, i) => (
                // Two elements on purpose: .reveal drives the entrance with a
                // transform transition, and mf-jitter is a transform
                // animation — on one element the animation would win and the
                // entrance would never play.
                <li
                  key={f}
                  className="reveal"
                  style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                >
                  <span
                    className="inline-flex items-center rounded-full border border-line bg-panel px-4 py-2 text-[0.84rem] text-muted"
                    style={
                      {
                        "--tilt": `${JITTER[i].tilt}deg`,
                        animation: `mf-jitter ${JITTER[i].dur} ease-in-out ${JITTER[i].delay} infinite`,
                      } as React.CSSProperties
                    }
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="reveal flex items-center gap-4 my-10"
              style={{ "--reveal-delay": "480ms" } as React.CSSProperties}
            >
              <span className="h-px grow bg-line" />
              <span className="u-label">MediFlow</span>
              <span className="h-px grow bg-line" />
            </div>

            {/* reconciled */}
            <div
              className="reveal bg-panel border border-line rounded-lg divide-y divide-line-soft"
              style={{ "--reveal-delay": "560ms" } as React.CSSProperties}
            >
              {[
                ["One product record", "SKU, brand, supplier, cost, price, unit"],
                ["One stock number", "Decremented inside the order transaction"],
                ["One customer file", "Contact, address, GST, order history"],
                ["One order total", "Subtotal, GST, discount, shipping — computed once"],
              ].map(([title, detail]) => (
                <div key={title} className="flex items-baseline gap-4 px-5 py-4">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-sage shrink-0 translate-y-[-2px]"
                  />
                  <div>
                    <p className="text-[0.95rem] font-medium">{title}</p>
                    <p className="u-meta mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
