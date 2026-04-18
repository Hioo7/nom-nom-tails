import type { SafeUser } from '../../../types';
import UserCard from './UserCard';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';

interface UserGridProps {
  users: SafeUser[];
  onAction: (action: ActionType, user: SafeUser) => void;
}

export default function UserGrid({ users, onAction }: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-base-content/40">
        <span className="text-5xl">🐾</span>
        <p className="text-sm font-medium">No staff members yet</p>
        <p className="text-xs">Add your first staff member to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onAction={onAction} />
      ))}
    </div>
  );
}
