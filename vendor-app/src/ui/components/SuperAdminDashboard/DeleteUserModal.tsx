import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { ApiError, SafeUser } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';

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
    <MobileModalShell
      dialogRef={dialogRef}
      title="Delete staff member"
      description="This permanently removes the account from the system."
      icon={<FiAlertTriangle size={18} className="text-error" />}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="btn btn-ghost order-2 w-full sm:order-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error order-1 w-full sm:order-2"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Delete staff member'}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-4">
        <p className="text-sm text-base-content/70">
          This action cannot be undone. Double-check the staff member below before continuing.
        </p>
      </div>

      <div className="rounded-2xl border border-base-200 bg-base-200/60 px-4 py-4">
        <p className="font-semibold text-base-content">{user.name}</p>
        <p className="mt-1 break-all text-sm text-base-content/60">{user.email}</p>
        <span className="badge badge-sm badge-ghost mt-3">{user.role.replace('_', ' ')}</span>
      </div>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}
