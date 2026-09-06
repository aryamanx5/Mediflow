import dashboardBg from "../assets/backgrounds/dashboard.webp";
import productsBg from "../assets/backgrounds/products.webp";
import customersBg from "../assets/backgrounds/customers.webp";
import ordersBg from "../assets/backgrounds/orders.webp";

/**
 * The photograph the dashboard is composed over.
 *
 * Each section gets the room its work actually happens in — the stockroom
 * behind Products, the reception desk behind Customers, the dispatch bay
 * behind Orders — with the corridor as the house default. Fixed to the
 * viewport, so it holds still while a long table scrolls across it.
 *
 * This layer does nothing to the image at all. It used to carry a paper
 * gradient, a radial pool under the page title and a pair of sage/clay
 * washes, and later a global 2px blur and a flat veil; every one of those
 * softened the whole room to buy legibility that belongs somewhere else.
 * The photograph now renders exactly as shot — full contrast, full colour,
 * completely sharp.
 *
 * That sharpness is load-bearing. The panels above soften only what is
 * directly behind them (see the surface tiers in index.css), so the crisp
 * room in the gutters around them is what makes those panels read as glass
 * lying on a scene rather than as fog covering one.
 *
 * Readability is not this layer's job. It belongs to the surfaces above and
 * to type weight and contrast.
 */

const BACKDROPS = {
  dashboard: dashboardBg,
  products: productsBg,
  customers: customersBg,
  orders: ordersBg,
} as const;

export type BackdropName = keyof typeof BACKDROPS;

/**
 * Where each photograph is anchored. A default `center` crop was burying the
 * most interesting part of these frames behind the content column.
 */
const FOCUS: Record<BackdropName, string> = {
  // the open corridor and its windows, rather than the ceiling
  dashboard: "50% 55%",
  // the aisle and cold-storage run, lifted off the darkest shelving so the
  // table is not reading against a wall of navy bins
  products: "46% 40%",
  // the reception counter and its signage, above the seated figures whose
  // silhouettes were swallowing the customer-name column
  customers: "56% 32%",
  // the dispatch bay and the van, below the overhead sign
  orders: "58% 48%",
};

/**
 * A very light, flat wash over the whole photograph. This is NOT a blur and
 * NOT a fog: at 8% it barely lifts the baseline of the scene so the panels
 * above start from a fractionally calmer image, without making the room milky
 * or low-contrast. Every detail — people, shelves, signage, architecture,
 * colour — is still fully there. The panels do the real local work; this only
 * takes the hardest edge off the busiest frames.
 */
const GLOBAL_WASH = "rgb(252 252 250 / 0.08)";

export function PageBackdrop({ name }: { name: BackdropName }) {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <img
        src={BACKDROPS[name]}
        alt=""
        decoding="async"
        className="size-full object-cover"
        style={{ objectPosition: FOCUS[name] }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: GLOBAL_WASH }} />
    </div>
  );
}
