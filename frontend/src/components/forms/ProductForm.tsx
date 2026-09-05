import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FieldRow, TextField } from "../ui/Field";
import { ApiError } from "../../services/client";
import type { ProductInput } from "../../services/api";
import type { Product } from "../../services/types";

/** Field set mirrors exactly what the Product schema requires. */
const BLANK = {
  productName: "",
  sku: "",
  category: "",
  brand: "",
  supplier: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  stockQuantity: "",
  minimumStock: "",
  unit: "",
};

type Values = typeof BLANK;

export function ProductForm({
  open,
  product,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** Present when editing; null when creating. */
  product: Product | null;
  onClose: () => void;
  onSubmit: (input: ProductInput) => Promise<void>;
}) {
  const [values, setValues] = useState<Values>(BLANK);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues(
      product
        ? {
            productName: product.productName,
            sku: product.sku,
            category: product.category,
            brand: product.brand,
            supplier: product.supplier,
            description: product.description ?? "",
            costPrice: String(product.costPrice),
            sellingPrice: String(product.sellingPrice),
            stockQuantity: String(product.stockQuantity),
            minimumStock: String(product.minimumStock),
            unit: product.unit,
          }
        : BLANK,
    );
  }, [open, product]);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        productName: values.productName.trim(),
        sku: values.sku.trim(),
        category: values.category.trim(),
        brand: values.brand.trim(),
        supplier: values.supplier.trim(),
        description: values.description.trim(),
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        minimumStock: Number(values.minimumStock),
        unit: values.unit.trim(),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={product ? "Edit product" : "Add product"}
      description={
        product ? `SKU ${product.sku}` : "Everything marked with an asterisk is required."
      }
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        <FieldRow>
          <TextField
            label="Product name"
            required
            value={values.productName}
            onChange={set("productName")}
          />
          <TextField
            label="SKU"
            required
            value={values.sku}
            onChange={set("sku")}
            hint="Must be unique across the catalogue."
          />
        </FieldRow>

        <FieldRow cols={3}>
          <TextField label="Category" required value={values.category} onChange={set("category")} />
          <TextField label="Brand" required value={values.brand} onChange={set("brand")} />
          <TextField label="Supplier" required value={values.supplier} onChange={set("supplier")} />
        </FieldRow>

        <FieldRow cols={3}>
          <TextField
            label="Cost price"
            type="number"
            min={0}
            step="0.01"
            required
            value={values.costPrice}
            onChange={set("costPrice")}
          />
          <TextField
            label="Selling price"
            type="number"
            min={0}
            step="0.01"
            required
            value={values.sellingPrice}
            onChange={set("sellingPrice")}
          />
          <TextField
            label="Unit"
            required
            placeholder="Strip, box, bottle…"
            value={values.unit}
            onChange={set("unit")}
          />
        </FieldRow>

        <FieldRow>
          <TextField
            label="Stock quantity"
            type="number"
            min={0}
            required
            value={values.stockQuantity}
            onChange={set("stockQuantity")}
          />
          <TextField
            label="Minimum stock"
            type="number"
            min={0}
            required
            hint="The level at which this product is flagged for reorder."
            value={values.minimumStock}
            onChange={set("minimumStock")}
          />
        </FieldRow>

        <TextField label="Description" value={values.description} onChange={set("description")} />

        {error && (
          <p role="alert" className="text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {product ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
