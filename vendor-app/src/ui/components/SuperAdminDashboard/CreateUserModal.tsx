import { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { ApiError, ApiErrorField, FieldErrors } from '../../../types';
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
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg">Add Staff Member</h3>
        <p className="text-sm text-base-content/60 mt-1">Create a new staff account.</p>

        <div className="flex flex-col gap-3 mt-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Full Name</legend>
            <input
              type="text"
              className={`input w-full${fieldErrors.name ? ' input-error' : ''}`}
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            {fieldErrors.name && <p className="text-error text-xs mt-1">{fieldErrors.name}</p>}
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Email Address</legend>
            <input
              type="email"
              className={`input w-full${fieldErrors.email ? ' input-error' : ''}`}
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.email && <p className="text-error text-xs mt-1">{fieldErrors.email}</p>}
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Password</legend>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input w-full pr-10${fieldErrors.password ? ' input-error' : ''}`}
                placeholder="Min. 8 characters"
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
            {fieldErrors.password && (
              <p className="text-error text-xs mt-1">{fieldErrors.password}</p>
            )}
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Role</legend>
            <select
              className="select w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              disabled={isSubmitting}
            >
              <option value="ADMIN">Admin</option>
              <option value="DELIVERY_PARTNER">Delivery Partner</option>
            </select>
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
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
