"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Confirmation modal shown when the user tries to leave the board (in-app)
// with unsaved layout changes. Mirrors the controlled <dialog> pattern used by
// BoardAddImagesModal: imperatively driven from the `open` prop. ESC and
// backdrop clicks resolve to "stay" via the dialog's native close.
export default function UnsavedChangesModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Imperatively drive the native <dialog> from the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onCancel}
      aria-labelledby="unsaved-changes-title"
    >
      <div className="modal-box">
        <h3
          id="unsaved-changes-title"
          className="font-display font-medium text-2xl tracking-[-0.01em]"
        >
          Unsaved changes
        </h3>
        <p className="py-4 text-base-content/70">
          You have unsaved changes to this board&apos;s layout. If you leave now,
          those changes will be lost.
        </p>
        <div className="modal-action">
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Stay
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary">
            Leave without saving
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
