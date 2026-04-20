import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { Dish } from '../../../types';
import { getErrorMessage } from './orderFormatters';

interface DeleteDishModalProps {
  dish: Dish;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteDishModal({ dish, onConfirm, onClose }: DeleteDishModalProps) {
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
      setErrorMessage(getErrorMessage(err, 'Failed to delete dish.'));
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
              <h3 className="font-bold text-base text-base-content">Delete Dish</h3>
              <p className="text-sm text-base-content/60">
                Remove this dish from your catalog. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <p className="text-sm text-base-content/70">
            Do you want to delete the dish <span className="font-semibold text-base-content">{dish.name}</span>?
          </p>

          {errorMessage ? (
            <div className="alert alert-error text-sm">
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="pt-2 flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error flex-1"
              onClick={() => {
                void handleConfirm();
              }}
              disabled={isSubmitting}
            >
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
