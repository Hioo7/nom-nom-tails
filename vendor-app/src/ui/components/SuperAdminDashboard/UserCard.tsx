import { FiChevronRight } from 'react-icons/fi';
import type { SafeUser } from '../../../types';

interface UserCardProps {
  user: SafeUser;
  onManage: (user: SafeUser) => void;
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

export default function UserCard({ user, onManage }: UserCardProps) {
  const avatarColor = ROLE_AVATAR[user.role] ?? 'bg-neutral text-neutral-content';
  const badgeColor = ROLE_BADGE[user.role] ?? 'badge-neutral';
  const roleLabel = ROLE_LABEL[user.role] ?? user.role;

  return (
    <div className="card border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="card-body gap-4 p-4">
        <div className="flex items-start gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div className={`rounded-full w-10 h-10 text-sm font-bold ${avatarColor}`}>
              <span>{getInitials(user.name)}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-base-content">
                  {user.name}
                </p>
                <p className="mt-1 truncate text-xs leading-tight text-base-content/50">
                  {user.email}
                </p>
              </div>

              <span className={`badge badge-sm whitespace-nowrap ${badgeColor}`}>{roleLabel}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user.isActive ? (
                <span className="badge badge-sm badge-success badge-outline">Active</span>
              ) : (
                <span className="badge badge-sm badge-error badge-outline">Inactive</span>
              )}
              <span className="badge badge-sm badge-ghost">Joined {new Date(user.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm justify-between rounded-full"
          onClick={() => onManage(user)}
        >
          <span>Manage staff</span>
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
