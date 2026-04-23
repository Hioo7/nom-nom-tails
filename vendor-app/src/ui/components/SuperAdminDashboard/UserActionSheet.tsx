import { FiEdit2, FiLock, FiShield, FiTrash2 } from 'react-icons/fi';
import type { SafeUser } from '../../../types';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';

interface UserActionSheetProps {
  user: SafeUser | null;
  onAction: (action: ActionType, user: SafeUser) => void;
  onClose: () => void;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick: () => void;
}

function ActionButton({ icon, label, className = '', onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-outline h-14 justify-start rounded-2xl border-base-300 text-left ${className}`}
      onClick={onClick}
    >
      <span className="mr-2 text-base-content/70">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function UserActionSheet({ user, onAction, onClose }: UserActionSheetProps) {
  if (!user) {
    return null;
  }

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-md rounded-t-3xl sm:rounded-3xl">
        <div>
          <p className="text-sm font-medium text-base-content/50">Manage staff member</p>
          <h3 className="mt-1 text-lg font-bold text-base-content">{user.name}</h3>
          <p className="mt-1 text-sm text-base-content/60">{user.email}</p>
        </div>

        <div className="mt-6 grid gap-3">
          <ActionButton
            icon={<FiEdit2 size={18} />}
            label="Edit email"
            onClick={() => onAction('editEmail', user)}
          />
          <ActionButton
            icon={<FiLock size={18} />}
            label="Change password"
            onClick={() => onAction('changePassword', user)}
          />
          <ActionButton
            icon={<FiShield size={18} />}
            label="Change role"
            onClick={() => onAction('changeRole', user)}
          />
          <ActionButton
            icon={<FiTrash2 size={18} />}
            label="Delete staff member"
            onClick={() => onAction('delete', user)}
          />
        </div>

        <div className="modal-action mt-6">
          <button type="button" className="btn btn-ghost w-full rounded-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
