import { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import type { ApiError, ApiErrorField, FieldErrors } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';
import PasswordStrengthIndicator from '../shared/PasswordStrengthIndicator';

type StaffRole = 'ADMIN' | 'DELIVERY_PARTNER';

interface CreateUserModalProps {
  onConfirm: (name: string, email: string, password: string, role: StaffRole) => Promise<void>;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateUserModal({ onConfirm, onClose }: CreateUserModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<StaffRole>('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const isValid =
    name.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    password.length >= 8;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});
    try {
      await onConfirm(name.trim(), email.trim(), password, role);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.fields) {
        const mapped: FieldErrors = {};
        apiErr.fields.forEach((f: ApiErrorField) => {
          mapped[f.path] = f.message;
        });
        setFieldErrors(mapped);
      }
      setErrorMessage(apiErr?.message ?? 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileModalShell
      dialogRef={dialogRef}
      title="Add staff member"
      description="Create a new staff account with a touch-friendly mobile form."
      icon={<FiUserPlus size={18} className="text-primary" />}
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
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create staff account'}
          </button>
        </div>
      }
    >
      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">Full name</legend>
        <input
          type="text"
          className={`input input-md w-full${fieldErrors.name ? ' input-error' : ''}`}
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
        {fieldErrors.name ? <p className="mt-1 text-xs text-error">{fieldErrors.name}</p> : null}
      </fieldset>

      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">Email address</legend>
        <input
          type="email"
          className={`input input-md w-full${fieldErrors.email ? ' input-error' : ''}`}
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.email ? <p className="mt-1 text-xs text-error">{fieldErrors.email}</p> : null}
      </fieldset>

      <fieldset className="fieldset py-0">
        <legend className="fieldset-legend">Temporary password</legend>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`input input-md w-full pr-10${fieldErrors.password ? ' input-error' : ''}`}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-base-content"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            disabled={isSubmitting}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <PasswordStrengthIndicator password={password} />
        {fieldErrors.password ? <p className="mt-1 text-xs text-error">{fieldErrors.password}</p> : null}
      </fieldset>

      <div className="flex flex-col gap-3">
        <div>
          <p className="fieldset-legend">Role</p>
          <p className="text-sm text-base-content/60">
            Choose how this staff member will use the app on mobile.
          </p>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              role === 'ADMIN'
                ? 'border-primary bg-primary/8 ring-1 ring-primary/20'
                : 'border-secondary/30 bg-secondary/5'
            }`}
            onClick={() => setRole('ADMIN')}
            disabled={isSubmitting}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-base-content">Admin</p>
                <p className="mt-1 text-sm text-base-content/60">
                  Manage operations, orders, and internal workflows.
                </p>
              </div>
              <span className="badge badge-sm badge-secondary">
                {role === 'ADMIN' ? 'Selected' : 'Choose'}
              </span>
            </div>
          </button>

          <button
            type="button"
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              role === 'DELIVERY_PARTNER'
                ? 'border-primary bg-primary/8 ring-1 ring-primary/20'
                : 'border-accent/30 bg-accent/5'
            }`}
            onClick={() => setRole('DELIVERY_PARTNER')}
            disabled={isSubmitting}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-base-content">Delivery Partner</p>
                <p className="mt-1 text-sm text-base-content/60">
                  Capture available orders and complete deliveries on the go.
                </p>
              </div>
              <span className="badge badge-sm badge-accent">
                {role === 'DELIVERY_PARTNER' ? 'Selected' : 'Choose'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}
