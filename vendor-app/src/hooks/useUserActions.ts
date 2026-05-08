import { UserService } from '../services/user.service';
import { useAuth } from './useAuth';

const userService = new UserService();

interface UseUserActionsReturn {
  updateUserEmail: (id: string, email: string) => Promise<void>;
  updateUserPassword: (id: string, password: string) => Promise<void>;
  updateUserRole: (id: string, role: 'ADMIN' | 'DELIVERY_PARTNER' | 'CHEF') => Promise<void>;
  createUser: (name: string, email: string, password: string, role: 'ADMIN' | 'DELIVERY_PARTNER' | 'CHEF') => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export function useUserActions(refetch: () => void): UseUserActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const updateUserEmail = async (id: string, email: string): Promise<void> => {
    await userService.updateUser(ensureToken(), id, { email });
    refetch();
  };

  const updateUserPassword = async (id: string, password: string): Promise<void> => {
    await userService.updateUser(ensureToken(), id, { password });
    refetch();
  };

  const updateUserRole = async (id: string, role: 'ADMIN' | 'DELIVERY_PARTNER' | 'CHEF'): Promise<void> => {
    await userService.updateUser(ensureToken(), id, { role });
    refetch();
  };

  const createUser = async (
    name: string,
    email: string,
    password: string,
    role: 'ADMIN' | 'DELIVERY_PARTNER' | 'CHEF',
  ): Promise<void> => {
    await userService.createUser(ensureToken(), { name, email, password, role });
    refetch();
  };

  const deleteUser = async (id: string): Promise<void> => {
    await userService.deleteUser(ensureToken(), id);
    refetch();
  };

  return { updateUserEmail, updateUserPassword, updateUserRole, createUser, deleteUser };
}
