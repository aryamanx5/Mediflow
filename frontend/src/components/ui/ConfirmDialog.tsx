import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

/**
 * Destructive actions in the old frontend fired immediately on click.
 * Deletes are irreversible against the live database, so they now confirm.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[0.92rem] text-ink-soft leading-relaxed">{body}</p>
      <div className="flex justify-end gap-2 mt-8">
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={run} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
