import { useEffect, useRef, useState } from 'react';
import { FiMail } from 'react-icons/fi';
import type { ApiError } from '../../../types';
import MobileModalShell from './MobileModalShell';

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
    <MobileModalShell
      dialogRef={dialogRef}
      title="Edit email"
      description="Update the account email with a mobile-friendly form."
      icon={<FiMail size={18} className="text-primary" />}
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
            className="btn btn-primary order-1 w-full sm:order-2"
            disabled={!isValid || isSubmitting}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Save email'}
          </button>
        </div>
      }
    >
      <div className="rounded-2xl bg-base-200/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-base-content/45">
          Current email
        </p>
        <p className="mt-1 break-all text-sm font-medium text-base-content">{currentEmail}</p>
      </div>

      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">New email address</legend>
        <input
          type="email"
          className="input input-md w-full"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          disabled={isSubmitting}
          autoFocus
          placeholder="jane@example.com"
        />
      </fieldset>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}
