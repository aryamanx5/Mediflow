import { Link } from "react-router-dom";
import { Wordmark } from "../Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 py-14">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <Wordmark />
            <p className="u-meta mt-3 max-w-xs">
              Inventory, customers and orders for pharmacy operations.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <p className="u-label mb-3">Product</p>
              <ul className="space-y-2 text-[0.85rem] text-ink-soft">
                <li><a href="#inventory" className="hover:text-ink transition-colors">Inventory</a></li>
                <li><a href="#customers" className="hover:text-ink transition-colors">Customers</a></li>
                <li><a href="#orders" className="hover:text-ink transition-colors">Orders</a></li>
              </ul>
            </div>
            <div>
              <p className="u-label mb-3">Access</p>
              <ul className="space-y-2 text-[0.85rem] text-ink-soft">
                <li><Link to="/signin" className="hover:text-ink transition-colors">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-ink transition-colors">Create account</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-line-soft flex flex-wrap justify-between gap-4">
          <p className="u-meta">© {new Date().getFullYear()} MediFlow</p>
          <p className="u-meta">Built on the Mediversal inventory service</p>
        </div>
      </div>
    </footer>
  );
}
