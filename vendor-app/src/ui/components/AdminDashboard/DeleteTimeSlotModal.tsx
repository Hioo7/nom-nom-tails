import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { TimeSlot } from '../../../types';
import { formatDay, getErrorMessage } from './orderFormatters';

interface DeleteTimeSlotModalProps {
  slot: TimeSlot;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteTimeSlotModal({
  slot,
  onConfirm,
  onClose,
}: DeleteTimeSlotModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Failed to delete time slot.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box w-full sm:max-w-md flex flex-col max-h-[85dvh] p-0 gap-0 overflow-hidden">
        <div className="shrink-0 border-b border-base-200 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-error/10 p-2.5 text-error">
              <FiAlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-base-content">Delete Time Slot</h3>
              <p className="text-sm text-base-content/60">
                Remove this delivery window from the selected day.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <p className="text-sm text-base-content/70">
            Are you sure you want to delete this time slot? This action cannot be undone.
          </p>

          <div className="rounded-box bg-error/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-error/70">
              Time slot
            </p>
            <p className="mt-1 font-semibold text-base-content">
              {slot.startTime} - {slot.endTime}
            </p>
            <p className="text-sm text-base-content/60">{formatDay(slot.day)}</p>
          </div>

          {errorMessage ? (
            <div className="alert alert-error text-sm">
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="pt-2 flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-error flex-1" onClick={() => { void handleConfirm(); }} disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
