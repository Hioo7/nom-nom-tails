import { useState } from 'react';
import { FiEdit2, FiLock, FiLogOut, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useMe } from '../../../hooks/useMe';
import EditEmailModal from './EditEmailModal';
import ChangePasswordModal from './ChangePasswordModal';
import LogoutConfirmModal from './LogoutConfirmModal';

type ModalType = 'editEmail' | 'changePassword' | 'logout' | null;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatRole(role: string): string {
  return role.replace(/_/g, ' ');
}

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const { updateEmail, updatePassword } = useMe();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  if (!user) return null;

  const initials = getInitials(user.name);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-10 pb-6">
      <div className="avatar avatar-placeholder">
        <div className="w-24 rounded-full bg-primary text-primary-content text-2xl font-bold">
          <span>{initials}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-2xl font-bold text-base-content">{user.name}</h2>
        <span className="badge badge-accent badge-lg font-semibold tracking-wide">
          {formatRole(user.role)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-base-content/60 bg-base-200 px-4 py-2.5 rounded-full">
        <FiMail size={15} />
        <span className="text-sm font-medium">{user.email}</span>
        <button
          className="btn btn-ghost btn-xs rounded-full ml-0.5"
          onClick={() => setActiveModal('editEmail')}
          title="Edit email"
        >
          <FiEdit2 size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <button
          className="btn btn-neutral w-full gap-2"
          onClick={() => setActiveModal('changePassword')}
        >
          <FiLock size={16} />
          Change Password
        </button>
        <button
          className="btn btn-error btn-outline w-full gap-2"
          onClick={() => setActiveModal('logout')}
        >
          <FiLogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="text-xs text-base-content/30 mt-2">
        Member since {new Date(user.createdAt).getFullYear()}
      </div>

      {activeModal === 'editEmail' && (
        <EditEmailModal
          currentEmail={user.email}
          onConfirm={updateEmail}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'changePassword' && (
        <ChangePasswordModal
          mode="self"
          onConfirm={({ currentPassword, newPassword }) =>
            updatePassword(currentPassword ?? '', newPassword)
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'logout' && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
