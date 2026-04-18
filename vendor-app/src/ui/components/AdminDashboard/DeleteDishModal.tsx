import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { ApiError, Dish } from '../../../types';

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
      const apiErr = err as ApiError;
      setErrorMessage(apiErr?.message ?? 'Failed to delete dish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-error/10 p-2 rounded-full">
            <FiAlertTriangle size={20} className="text-error" />
          </div>
          <h3 className="font-bold text-lg">Delete Dish</h3>
        </div>

        <p className="text-sm text-base-content/70 mb-3">
          Are you sure you want to delete this dish? This action cannot be undone.
        </p>

        <div className="bg-error/10 rounded-box p-3">
          <p className="font-semibold text-base-content">{dish.name}</p>
          {dish.description && (
            <p className="text-sm text-base-content/60 truncate">{dish.description}</p>
          )}
        </div>

        {errorMessage && (
          <div className="alert alert-error text-sm mt-3 py-2">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Delete'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
