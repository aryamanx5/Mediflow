import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page, PageHeader } from "../layouts/AppLayout";
import { useResource } from "../hooks/useResource";
import { useDebounced } from "../hooks/useDebounced";
import { useToast } from "../hooks/useToast";
import { customers, type CustomerInput } from "../services/api";
import { ApiError } from "../services/client";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, SkeletonRows } from "../components/ui/States";
import { Pagination } from "../components/ui/Pagination";
import { SearchBar } from "../components/SearchBar";
import { TableShell, Td, Th, Tr } from "../components/ui/Table";
import { CustomerForm } from "../components/forms/CustomerForm";
import { Badge } from "../components/ui/Badge";
import type { Customer } from "../services/types";

const LIMIT = 10;

export default function Customers() {
  const { push } = useToast();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);

  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      params.delete("new");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => setPage(1), [debounced]);

  const load = useCallback(
    (signal: AbortSignal) =>
      customers.list({ search: debounced, page, limit: LIMIT }, signal),
    [debounced, page],
  );
  const { data, loading, error, refresh } = useResource(load, [debounced, page]);

  const rows = data?.data ?? [];

  const onSubmit = async (input: CustomerInput) => {
    if (editing) {
      await customers.update(editing._id, input);
      push("Customer updated", "success");
    } else {
      await customers.create(input);
      push("Customer added", "success");
    }
    setFormOpen(false);
    setEditing(null);
    refresh();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await customers.remove(pendingDelete._id);
      push("Customer deleted", "success");
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else refresh();
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't delete the customer.", "error");
    }
  };

  const meta = useMemo(() => {
    if (loading || !data) return undefined;
    return `${data.total} ${data.total === 1 ? "customer" : "customers"}${debounced ? ` matching “${debounced}”` : ""}`;
  }, [loading, data, debounced]);

  return (
    <Page>
      <PageHeader
        title="Customers"
        meta={meta}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add customer
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, ID or phone…"
        label="Search customers"
        busy={loading && search !== debounced}
      />

      <div className="mt-4">
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <TableShell>
            <table className="w-full min-w-[44rem]">
              <caption className="sr-only">Customer directory</caption>
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>ID</Th>
                  <Th>Phone</Th>
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th>
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={6} />
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title={debounced ? "No matching customers" : "No customers yet"}
                        body={
                          debounced
                            ? "Try a different name, customer ID or phone number."
                            : "Add a customer before placing their first order."
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
                              Add customer
                            </Button>
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  rows.map((c) => (
                    <Tr key={c._id}>
                      <Td>
                        <span className="font-medium">{c.customerName}</span>
                        <span className="block u-meta text-[0.72rem]">{c.email}</span>
                      </Td>
                      <Td className="font-mono text-[0.78rem] text-muted">{c.customerId}</Td>
                      <Td className="tabular">{c.phone}</Td>
                      <Td className="text-muted">
                        {c.city}
                        <span className="block u-meta text-[0.72rem]">
                          {c.state} — {c.pinCode}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={c.gstNumber ? "info" : "neutral"}>
                          {c.gstNumber ? "Business" : c.addressType}
                        </Badge>
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(c);
                              setFormOpen(true);
                            }}
                            aria-label={`Edit ${c.customerName}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-tint"
                            onClick={() => setPendingDelete(c)}
                            aria-label={`Delete ${c.customerName}`}
                          >
                            Delete
                          </Button>
                        </div>
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

      <CustomerForm
        open={formOpen}
        customer={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this customer?"
        body={`“${pendingDelete?.customerName}” (${pendingDelete?.customerId}) will be removed permanently. Existing orders will keep their totals but show the customer as removed.`}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Page>
  );
}
