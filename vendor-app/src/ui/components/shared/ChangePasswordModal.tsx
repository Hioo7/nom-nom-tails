import { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { ApiError } from '../../../types';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

interface ChangePasswordModalProps {
  mode: 'self' | 'other';
  onConfirm: (payload: ChangePasswordPayload) => Promise<void>;
  onClose: () => void;
}

function ShowHideButton({
  show,
  onToggle,
  disabled,
}: {
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-base-content"
      onClick={onToggle}
      tabIndex={-1}
      disabled={disabled}
    >
      {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
    </button>
  );
}

export default function ChangePasswordModal({ mode, onConfirm, onClose }: ChangePasswordModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const passwordsMatch = newPassword === confirmPassword;
  const newPasswordValid = newPassword.trim().length >= 8;
  const currentPasswordValid = mode === 'self' ? currentPassword.trim().length > 0 : true;
  const isValid = currentPasswordValid && newPasswordValid && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm({
        ...(mode === 'self' ? { currentPassword: currentPassword.trim() } : {}),
        newPassword: newPassword,
      });
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr?.message ?? 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg">Change Password</h3>
        <p className="text-sm text-base-content/60 mt-1">
          {mode === 'self'
            ? 'Enter your current password and choose a new one.'
            : 'Set a new password for this user.'}
        </p>

        <div className="flex flex-col gap-3 mt-4">
          {mode === 'self' && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Current Password</legend>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="input w-full pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  autoComplete="current-password"
                />
                <ShowHideButton
                  show={showCurrent}
                  onToggle={() => setShowCurrent((s) => !s)}
                  disabled={isSubmitting}
                />
              </div>
            </fieldset>
          )}

          <fieldset className="fieldset">
            <legend className="fieldset-legend">New Password</legend>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input w-full pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                autoFocus={mode === 'other'}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
              />
              <ShowHideButton
                show={showNew}
                onToggle={() => setShowNew((s) => !s)}
                disabled={isSubmitting}
              />
            </div>
            <PasswordStrengthIndicator password={newPassword} />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Confirm Password</legend>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className={`input w-full pr-10${
                  confirmPassword && !passwordsMatch ? ' input-error' : ''
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
              <ShowHideButton
                show={showConfirm}
                onToggle={() => setShowConfirm((s) => !s)}
                disabled={isSubmitting}
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-error text-xs mt-1">Passwords do not match.</p>
            )}
          </fieldset>
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
