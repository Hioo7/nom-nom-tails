import { useCallback, useEffect, useState } from 'react';
import { UserService } from '../services/user.service';
import type { SafeUser } from '../types';
import { useAuth } from './useAuth';

const userService = new UserService();

interface UseUsersReturn {
  users: SafeUser[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useUsers(): UseUsersReturn {
  const { token } = useAuth();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    userService
      .listUsers(token)
      .then(setUsers)
      .catch(() => setError('Failed to load staff members.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
