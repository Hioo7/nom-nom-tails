import { useEffect, useRef, useState } from 'react';
import { FiShield } from 'react-icons/fi';
import type { ApiError, SafeUser } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';

type StaffRole = 'ADMIN' | 'DELIVERY_PARTNER' | 'CHEF';

const ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: 'Admin',
  DELIVERY_PARTNER: 'Delivery Partner',
  CHEF: 'Chef',
};

const ROLE_BADGE: Record<StaffRole, string> = {
  ADMIN: 'badge-secondary',
  DELIVERY_PARTNER: 'badge-accent',
  CHEF: 'badge-warning',
};

const ROLE_CARD_STYLES: Record<StaffRole, string> = {
  ADMIN: 'border-secondary/30 bg-secondary/5',
  DELIVERY_PARTNER: 'border-accent/30 bg-accent/5',
  CHEF: 'border-warning/30 bg-warning/5',
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
    <MobileModalShell
      dialogRef={dialogRef}
      title="Change role"
      description={
        <>
          Choose the new role for <span className="font-semibold text-base-content">{user.name}</span>.
        </>
      }
      icon={<FiShield size={18} className="text-primary" />}
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
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Save role'}
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2 rounded-2xl bg-base-200/70 px-4 py-3">
        <span className="text-sm text-base-content/60">Current role</span>
        <span className={`badge badge-sm ${ROLE_BADGE[currentRole]}`}>{ROLE_LABELS[currentRole]}</span>
      </div>

      <div className="grid gap-3">
        {(['ADMIN', 'DELIVERY_PARTNER', 'CHEF'] as const).map((role) => {
          const isSelected = selectedRole === role;

          return (
            <button
              key={role}
              type="button"
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-primary bg-primary/8 ring-1 ring-primary/20'
                  : ROLE_CARD_STYLES[role]
              }`}
              onClick={() => setSelectedRole(role)}
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-base-content">{ROLE_LABELS[role]}</p>
                  <p className="mt-1 text-sm text-base-content/60">
                    {role === 'ADMIN'
                      ? 'Can manage internal operations and staff workflows.'
                      : role === 'DELIVERY_PARTNER'
                        ? 'Handles order pickup, routing, and delivery updates.'
                        : 'Prepares and manages kitchen orders for daily delivery slots.'}
                  </p>
                </div>
                <span className={`badge badge-sm ${ROLE_BADGE[role]}`}>
                  {isSelected ? 'Selected' : 'Choose'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}
