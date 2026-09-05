import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page, PageHeader } from "../layouts/AppLayout";
import { useResource } from "../hooks/useResource";
import { useDebounced } from "../hooks/useDebounced";
import { useToast } from "../hooks/useToast";
import { orders, type OrderInput } from "../services/api";
import { money, relative } from "../lib/format";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, SkeletonRows } from "../components/ui/States";
import { Pagination } from "../components/ui/Pagination";
import { FilterSelect, SearchBar } from "../components/SearchBar";
import { TableShell, Td, Th, Tr } from "../components/ui/Table";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/ui/Badge";
import { OrderForm } from "../components/forms/OrderForm";
import { OrderDetail } from "../components/OrderDetail";
import type { OrderStatus, PaymentStatus } from "../services/types";

const LIMIT = 10;

/** Exactly the enum values the Order schema allows — no invented statuses. */
const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Paid", "Failed"];

export default function Orders() {
  const { push } = useToast();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);

  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") {
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => setPage(1), [debounced, orderStatus, paymentStatus]);

  const load = useCallback(
    (signal: AbortSignal) =>
      orders.list(
        {
          search: debounced,
          orderStatus: orderStatus as OrderStatus | "",
          paymentStatus: paymentStatus as PaymentStatus | "",
          page,
          limit: LIMIT,
        },
        signal,
      ),
    [debounced, orderStatus, paymentStatus, page],
  );
  const { data, loading, error, refresh } = useResource(load, [
    debounced,
    orderStatus,
    paymentStatus,
    page,
  ]);

  const rows = data?.data ?? [];
  const filtered = Boolean(debounced || orderStatus || paymentStatus);

  const placeOrder = async (input: OrderInput) => {
    await orders.create(input);
    push("Order placed", "success");
    setFormOpen(false);
    setPage(1);
    refresh();
  };

  const meta = useMemo(() => {
    if (loading || !data) return undefined;
    return `${data.total} ${data.total === 1 ? "order" : "orders"}${filtered ? " matching your filters" : ""}`;
  }, [loading, data, filtered]);

  return (
    <Page>
      <PageHeader
        title="Orders"
        meta={meta}
        actions={<Button onClick={() => setFormOpen(true)}>New order</Button>}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by order number or customer…"
        label="Search orders"
        busy={loading && search !== debounced}
      >
        <FilterSelect
          label="Status"
          value={orderStatus}
          onChange={setOrderStatus}
          options={[
            { value: "", label: "All" },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          label="Payment"
          value={paymentStatus}
          onChange={setPaymentStatus}
          options={[
            { value: "", label: "All" },
            ...PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </SearchBar>

      <div className="mt-4">
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <TableShell>
            <table className="w-full min-w-[48rem]">
              <caption className="sr-only">Orders</caption>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th align="right">Items</Th>
                  <Th align="right">Total</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={6} />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title={filtered ? "No matching orders" : "No orders yet"}
                        body={
                          filtered
                            ? "Try a different search term or clear the status filters."
                            : "Place an order to draw down stock and generate a bill."
                        }
                        action={
                          !filtered && (
                            <Button variant="secondary" size="sm" onClick={() => setFormOpen(true)}>
                              New order
                            </Button>
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  rows.map((o) => (
                    <Tr
                      key={o._id}
                      onClick={() => setDetailId(o._id)}
                      label={`View order ${o.orderNumber}`}
                    >
                      <Td>
                        <span className="font-mono text-[0.8rem]">{o.orderNumber}</span>
                        <span className="block u-meta text-[0.72rem]">
                          {relative(o.createdAt)}
                        </span>
                      </Td>
                      <Td>{o.customer?.customerName ?? <span className="text-faint">Removed</span>}</Td>
                      <Td align="right" className="tabular text-muted">
                        {o.items.length}
                      </Td>
                      <Td align="right" className="tabular font-medium">
                        {money(o.totalAmount)}
                      </Td>
                      <Td>
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </Td>
                      <Td>
                        <OrderStatusBadge status={o.orderStatus} />
                      </Td>
                    </Tr>
                  ))
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

      <OrderForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={placeOrder} />

      <OrderDetail
        orderId={detailId}
        onClose={() => setDetailId(null)}
        onCancelled={() => {
          push("Order cancelled — stock returned", "success");
          refresh();
        }}
      />
    </Page>
  );
}
