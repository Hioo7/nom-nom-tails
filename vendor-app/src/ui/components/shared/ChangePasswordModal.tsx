import { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import type { ApiError } from '../../../types';
import MobileModalShell from './MobileModalShell';
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
    <MobileModalShell
      dialogRef={dialogRef}
      title="Change password"
      description={
        mode === 'self'
          ? 'Enter your current password, then choose a secure new one.'
          : 'Set a new password for this account with larger mobile-friendly fields.'
      }
      icon={<FiLock size={18} className="text-primary" />}
      onClose={onClose}
      maxWidthClassName="sm:max-w-lg"
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
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Update password'}
          </button>
        </div>
      }
    >
      {mode === 'self' ? (
        <fieldset className="fieldset py-0">
          <legend className="fieldset-legend">Current password</legend>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              className="input input-md w-full pr-10"
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
      ) : null}

      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">New password</legend>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            className="input input-md w-full pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            autoFocus={mode === 'other'}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
          />
          <ShowHideButton
            show={showNew}
            onToggle={() => setShowNew((s) => !s)}
            disabled={isSubmitting}
          />
        </div>
        <PasswordStrengthIndicator password={newPassword} />
      </fieldset>

      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">Confirm password</legend>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            className={`input input-md w-full pr-10${
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
        {confirmPassword && !passwordsMatch ? (
          <p className="mt-1 text-xs text-error">Passwords do not match.</p>
        ) : null}
      </fieldset>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}
