import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page, PageHeader } from "../layouts/AppLayout";
import { useResource } from "../hooks/useResource";
import { useDebounced } from "../hooks/useDebounced";
import { useToast } from "../hooks/useToast";
import { products, type ProductInput } from "../services/api";
import { ApiError } from "../services/client";
import { money } from "../lib/format";
import { stockLabel, stockLevel } from "../lib/stock";
import { StockBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, SkeletonRows } from "../components/ui/States";
import { Pagination } from "../components/ui/Pagination";
import { SearchBar } from "../components/SearchBar";
import { TableShell, Td, Th, Tr } from "../components/ui/Table";
import { ProductForm } from "../components/forms/ProductForm";
import type { Product } from "../services/types";

const LIMIT = 10;

export default function Products() {
  const { push } = useToast();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);

  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  // ?new=1 from the overview's quick actions opens the form directly.
  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  // A new search term must reset to the first page, or an empty page 4 shows.
  useEffect(() => setPage(1), [debounced]);

  const load = useCallback(
    (signal: AbortSignal) =>
      products.list({ search: debounced, page, limit: LIMIT }, signal),
    [debounced, page],
  );
  const { data, loading, error, refresh } = useResource(load, [debounced, page]);

  const rows = data?.data ?? [];

  const onSubmit = async (input: ProductInput) => {
    if (editing) {
      await products.update(editing._id, input);
      push("Product updated", "success");
    } else {
      await products.create(input);
      push("Product added", "success");
    }
    setFormOpen(false);
    setEditing(null);
    refresh();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await products.remove(pendingDelete._id);
      push("Product deleted", "success");
      // Stepping back a page avoids landing on one that no longer exists.
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else refresh();
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't delete the product.", "error");
    }
  };

  const meta = useMemo(() => {
    if (loading || !data) return undefined;
    return `${data.total} ${data.total === 1 ? "product" : "products"}${debounced ? ` matching “${debounced}”` : ""}`;
  }, [loading, data, debounced]);

  return (
    <Page>
      <PageHeader
        title="Products"
        meta={meta}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add product
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name or SKU…"
        label="Search products"
        busy={loading && search !== debounced}
      />

      <div className="mt-4">
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <TableShell>
            <table className="w-full min-w-[46rem]">
              <caption className="sr-only">Product inventory</caption>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th>Category</Th>
                  <Th align="right">Price</Th>
                  <Th align="right">Stock</Th>
                  <Th>Status</Th>
                  <Th><span className="sr-only">Actions</span></Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={7} />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title={debounced ? "No matching products" : "No products yet"}
                        body={
                          debounced
                            ? "Try a different name or SKU."
                            : "Add your first product to start tracking stock."
                        }
                        action={
                          !debounced && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                              }}
                            >
                              Add product
                            </Button>
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => {
                    const level = stockLevel(p);
                    return (
                      <Tr key={p._id}>
                        <Td>
                          <span className="font-medium">{p.productName}</span>
                          <span className="block u-meta text-[0.72rem]">
                            {p.brand} · {p.supplier}
                          </span>
                        </Td>
                        <Td className="font-mono text-[0.78rem] text-muted">{p.sku}</Td>
                        <Td className="text-muted">{p.category}</Td>
                        <Td align="right" className="tabular">
                          {money(p.sellingPrice)}
                        </Td>
                        <Td align="right" className="tabular whitespace-nowrap">
                          {p.stockQuantity}
                          <span className="text-faint"> {p.unit}</span>
                        </Td>
                        <Td>
                          <StockBadge level={level}>{stockLabel[level]}</StockBadge>
                        </Td>
                        <Td align="right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
                              aria-label={`Edit ${p.productName}`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:bg-danger-tint"
                              onClick={() => setPendingDelete(p)}
                              aria-label={`Delete ${p.productName}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {!loading && rows.length > 0 && data && (
              <Pagination
                page={data.currentPage}
                totalPages={data.totalPages}
                total={data.total}
                onChange={setPage}
              />
            )}
          </TableShell>
        )}
      </div>

      <ProductForm
        open={formOpen}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this product?"
        body={`“${pendingDelete?.productName}” (${pendingDelete?.sku}) will be removed permanently. Orders that already reference it will show the line as removed.`}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Page>
  );
}
