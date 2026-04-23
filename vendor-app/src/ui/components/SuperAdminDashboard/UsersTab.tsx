import { useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { useUserActions } from '../../../hooks/useUserActions';
import { useUsers } from '../../../hooks/useUsers';
import type { SafeUser } from '../../../types';
import EditEmailModal from '../shared/EditEmailModal';
import ChangePasswordModal from '../shared/ChangePasswordModal';
import ChangeRoleModal from './ChangeRoleModal';
import CreateUserModal from './CreateUserModal';
import DeleteUserModal from './DeleteUserModal';
import UserGrid from './UserGrid';
import UserActionSheet from './UserActionSheet';

type ActionType = 'editEmail' | 'changePassword' | 'changeRole' | 'delete';
type ModalType = ActionType | 'create' | null;

interface UsersTabProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function UsersTab({
  searchValue,
  onSearchChange,
}: UsersTabProps) {
  const { users, isLoading, error, refetch } = useUsers();
  const { updateUserEmail, updateUserPassword, updateUserRole, createUser, deleteUser } =
    useUserActions(refetch);

  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return users.filter((user) => {
      return (
        normalizedSearch.length === 0 ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchValue, users]);

  const hasActiveFilters = searchValue.trim().length > 0;
  const countLabel = hasActiveFilters
    ? `${filteredUsers.length} of ${users.length} staff visible`
    : `${users.length} member${users.length !== 1 ? 's' : ''}`;

  const openModal = (modal: ModalType, user?: SafeUser) => {
    if (user) {
      setSelectedUser(user);
    }

    setIsActionSheetOpen(false);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
  };

  const handleAction = (action: ActionType, user: SafeUser) => {
    openModal(action, user);
  };

  const resetFilters = () => {
    onSearchChange('');
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
        <div className="space-y-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-base-content">Staff workspace</h1>
            <p className="text-xs text-base-content/50">{countLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="input input-bordered flex flex-1 items-center gap-2 rounded-2xl bg-base-100">
              <FiSearch size={16} className="text-base-content/40" />
              <input
                type="text"
                className="grow"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search name or email"
                aria-label="Search staff members"
              />
              {searchValue.trim() ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square rounded-full"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              ) : null}
            </label>

            <button
              type="button"
              className="btn btn-primary btn-square btn-md shrink-0 rounded-2xl"
              onClick={() => openModal('create')}
              aria-label="Add staff"
              title="Add staff"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pb-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={refetch}>Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="card border border-dashed border-base-300 bg-base-200/40">
            <div className="card-body items-center py-12 text-center">
              <span className="text-5xl">🐾</span>
              <h3 className="font-semibold text-base-content">No staff members yet</h3>
              <p className="max-w-xs text-sm text-base-content/60">
                Add your first admin or delivery partner to start managing operations.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-full"
                onClick={() => openModal('create')}
              >
                Add Staff
              </button>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card border border-base-200 bg-base-200/40">
            <div className="card-body items-center py-12 text-center">
              <h3 className="font-semibold text-base-content">No matching staff</h3>
              <p className="max-w-xs text-sm text-base-content/60">
                Try a different search term or clear the current search.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm rounded-full"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <UserGrid
            users={filteredUsers}
            onManage={(user) => {
              setSelectedUser(user);
              setIsActionSheetOpen(true);
            }}
          />
        )}
      </div>

      {isActionSheetOpen ? (
        <UserActionSheet user={selectedUser} onAction={handleAction} onClose={closeModal} />
      ) : null}

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
