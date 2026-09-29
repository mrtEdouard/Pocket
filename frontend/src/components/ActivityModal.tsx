import { useEffect, useRef } from "react";

import type { Activity } from "../types/activity";
import { ActivityForm } from "./ActivityForm";

interface ActivityModalProps {
  activity?: Activity | null;
  onClose: () => void;
  onSaved: (activity: Activity) => void;
}

export function ActivityModal({
  activity = null,
  onClose,
  onSaved,
}: ActivityModalProps) {
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
      className="activity-modal"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="activity-modal-content">
        <ActivityForm
          key={activity?.id ?? "new"}
          activity={activity}
          onCancel={onClose}
          onSaved={onSaved}
        />
      </div>
    </dialog>
  );
}
