import { FiEdit2, FiLock, FiShield, FiTrash2 } from 'react-icons/fi';
import type { SafeUser } from '../../../types';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';

interface UserCardActionsProps {
  user: SafeUser;
  onAction: (action: ActionType, user: SafeUser) => void;
}

export default function UserCardActions({ user, onAction }: UserCardActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-base-200">
      <button
        className="btn btn-ghost btn-xs btn-square"
        title="Edit Email"
        onClick={() => onAction('editEmail', user)}
      >
        <FiEdit2 size={14} />
      </button>
      <button
        className="btn btn-ghost btn-xs btn-square"
        title="Change Password"
        onClick={() => onAction('changePassword', user)}
      >
        <FiLock size={14} />
      </button>
      <button
        className="btn btn-ghost btn-xs btn-square"
        title="Change Role"
        onClick={() => onAction('changeRole', user)}
      >
        <FiShield size={14} />
      </button>
      <div className="w-px h-4 bg-base-300 mx-0.5" />
      <button
        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
        title="Delete"
        onClick={() => onAction('delete', user)}
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );
}
