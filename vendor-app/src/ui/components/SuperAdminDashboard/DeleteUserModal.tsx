import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { ApiError, SafeUser } from '../../../types';

interface DeleteUserModalProps {
  user: SafeUser;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteUserModal({ user, onConfirm, onClose }: DeleteUserModalProps) {
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
      setErrorMessage(apiErr?.message ?? 'Failed to delete user.');
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
          <h3 className="font-bold text-lg">Delete Staff Member</h3>
        </div>

        <p className="text-sm text-base-content/70 mb-3">
          Are you sure you want to delete this staff member? This action cannot be undone.
        </p>

        <div className="bg-error/10 rounded-box p-3">
          <p className="font-semibold text-base-content">{user.name}</p>
          <p className="text-sm text-base-content/60">{user.email}</p>
          <span className="badge badge-sm badge-ghost mt-1">{user.role.replace('_', ' ')}</span>
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
