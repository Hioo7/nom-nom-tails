import { MeService } from '../services/me.service';
import type { UpdateMePayload } from '../types';
import { useAuth } from './useAuth';

const meService = new MeService();

interface UseMeReturn {
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function useMe(): UseMeReturn {
  const { token, refreshUser } = useAuth();

  const ensureToken = (): string => {
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const updateEmail = async (email: string): Promise<void> => {
    const payload: UpdateMePayload = { email };
    await meService.updateMe(ensureToken(), payload);
    await refreshUser();
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const payload: UpdateMePayload = { currentPassword, newPassword };
    await meService.updateMe(ensureToken(), payload);
  };

  return { updateEmail, updatePassword };
}
