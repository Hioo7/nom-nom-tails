import type { SafeUser } from '../../../types';
import UserCardActions from './UserCardActions';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';

interface UserCardProps {
  user: SafeUser;
  onAction: (action: ActionType, user: SafeUser) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const ROLE_AVATAR: Record<string, string> = {
  ADMIN: 'bg-secondary text-secondary-content',
  DELIVERY_PARTNER: 'bg-accent text-accent-content',
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'badge-accent',
  DELIVERY_PARTNER: 'badge-accent',
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  DELIVERY_PARTNER: 'Delivery Partner',
};

export default function UserCard({ user, onAction }: UserCardProps) {
  const avatarColor = ROLE_AVATAR[user.role] ?? 'bg-neutral text-neutral-content';
  const badgeColor = ROLE_BADGE[user.role] ?? 'badge-neutral';
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div className={`rounded-full w-10 h-10 text-sm font-bold ${avatarColor}`}>
              <span>{getInitials(user.name)}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-base-content truncate leading-tight">{user.name}</p>
            <p className="text-xs text-base-content/50 truncate leading-tight">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`badge badge-xs ${badgeColor}`}>{roleLabel}</span>
              {user.isActive
                ? <span className="badge badge-xs badge-success badge-outline">Active</span>
                : <span className="badge badge-xs badge-error badge-outline">Inactive</span>
              }
            </div>
          </div>
        </div>

        <UserCardActions user={user} onAction={onAction} />
      </div>
    </div>
  );
}
