import { useEffect, useRef, useState } from 'react';
import { FiShield } from 'react-icons/fi';
import type { ApiError, SafeUser } from '../../../types';

type StaffRole = 'ADMIN' | 'DELIVERY_PARTNER';

const ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: 'Admin',
  DELIVERY_PARTNER: 'Delivery Partner',
};

const ROLE_BADGE: Record<StaffRole, string> = {
  ADMIN: 'badge-secondary',
  DELIVERY_PARTNER: 'badge-accent',
};

interface ChangeRoleModalProps {
  user: SafeUser;
  onConfirm: (newRole: StaffRole) => Promise<void>;
  onClose: () => void;
}

export default function ChangeRoleModal({ user, onConfirm, onClose }: ChangeRoleModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentRole = user.role as StaffRole;
  const [selectedRole, setSelectedRole] = useState<StaffRole>(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const isValid = selectedRole !== currentRole;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConfirm(selectedRole);
      onClose();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr?.message ?? 'Failed to update role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center gap-2 mb-1">
          <FiShield size={18} className="text-primary" />
          <h3 className="font-bold text-lg">Change Role</h3>
        </div>
        <p className="text-sm text-base-content/60 mb-4">
          Changing role for <span className="font-semibold text-base-content">{user.name}</span>
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Current:</span>
            <span className={`badge badge-sm ${ROLE_BADGE[currentRole]}`}>
              {ROLE_LABELS[currentRole]}
            </span>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">New Role</legend>
            <select
              className="select w-full"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
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
