import { useEffect, useRef, useState } from 'react';
import type { ApiError } from '../../../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EditEmailModalProps {
  currentEmail: string;
  onConfirm: (newEmail: string) => Promise<void>;
  onClose: () => void;
}

export default function EditEmailModal({ currentEmail, onConfirm, onClose }: EditEmailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [emailValue, setEmailValue] = useState(currentEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const trimmed = emailValue.trim();
  const isValid = EMAIL_REGEX.test(trimmed) && trimmed !== currentEmail;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr?.message ?? 'Failed to update email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg">Edit Email</h3>
        <p className="text-sm text-base-content/60 mt-1">Enter the new email address.</p>

        <fieldset className="fieldset mt-4">
          <legend className="fieldset-legend">Email Address</legend>
          <input
            type="email"
            className="input w-full"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </fieldset>

        {errorMessage && (
          <div className="alert alert-error text-sm mt-3 py-2">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Change'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
