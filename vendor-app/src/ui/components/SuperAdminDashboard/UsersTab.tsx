import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useUserActions } from '../../../hooks/useUserActions';
import { useUsers } from '../../../hooks/useUsers';
import type { SafeUser } from '../../../types';
import EditEmailModal from '../shared/EditEmailModal';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import ChangeRoleModal from './ChangeRoleModal';
import CreateUserModal from './CreateUserModal';
import DeleteUserModal from './DeleteUserModal';
import UserGrid from './UserGrid';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';
type ModalType = ActionType | 'create' | null;

export default function UsersTab() {
  const { users, isLoading, error, refetch } = useUsers();
  const { updateUserEmail, updateUserPassword, updateUserRole, createUser, deleteUser } =
    useUserActions(refetch);

  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modal: ModalType, user?: SafeUser) => {
    if (user) setSelectedUser(user);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
  };

  const handleAction = (action: ActionType, user: SafeUser) => {
    openModal(action, user);
  };

  return (
    <div>
      <div className="sticky top-0 bg-base-100/90 backdrop-blur-sm z-10 border-b border-base-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-base-content">Staff Management</h1>
          <p className="text-xs text-base-content/50">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5"
          onClick={() => openModal('create')}
        >
          <FiPlus size={16} />
          Add Staff
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={refetch}>Retry</button>
          </div>
        ) : (
          <UserGrid users={users} onAction={handleAction} />
        )}
      </div>

      {activeModal === 'create' && (
        <CreateUserModal
          onConfirm={createUser}
          onClose={closeModal}
        />
      )}

      {activeModal === 'editEmail' && selectedUser && (
        <EditEmailModal
          currentEmail={selectedUser.email}
          onConfirm={(email) => updateUserEmail(selectedUser.id, email)}
          onClose={closeModal}
        />
      )}

      {activeModal === 'changePassword' && selectedUser && (
        <ChangePasswordModal
          mode="other"
          onConfirm={({ newPassword }) => updateUserPassword(selectedUser.id, newPassword)}
          onClose={closeModal}
        />
      )}

      {activeModal === 'changeRole' && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          onConfirm={(role) => updateUserRole(selectedUser.id, role)}
          onClose={closeModal}
        />
      )}

      {activeModal === 'delete' && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onConfirm={() => deleteUser(selectedUser.id)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
