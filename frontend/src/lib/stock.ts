import type { Product } from "../services/types";

export type StockLevel = "out" | "low" | "ok";

/**
 * The backend has no stock-status field; it is derived from the two numbers
 * the Product schema does provide. Nothing here is invented.
 */
export function stockLevel(p: Pick<Product, "stockQuantity" | "minimumStock">): StockLevel {
  if (p.stockQuantity <= 0) return "out";
  if (p.stockQuantity <= p.minimumStock) return "low";
  return "ok";
}

export const stockLabel: Record<StockLevel, string> = {
  out: "Out of stock",
  low: "Low stock",
  ok: "In stock",
};
