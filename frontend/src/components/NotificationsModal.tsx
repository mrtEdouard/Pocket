import { useEffect, useRef } from "react";

interface NotificationsModalProps {
  onClose: () => void;
}

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      className="notifications-modal"
      ref={dialogRef}
      aria-labelledby="notifications-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <h2 id="notifications-title">Notifications</h2>
        <button type="button" aria-label="Fermer les notifications" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="notifications-modal-body" />
    </dialog>
  );
}
