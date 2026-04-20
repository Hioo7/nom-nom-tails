import { TimeSlotService } from '../services/timeSlot.service';
import type { CreateTimeSlotPayload, UpdateTimeSlotPayload } from '../types';
import { useAuth } from './useAuth';

const timeSlotService = new TimeSlotService();

interface UseTimeSlotActionsReturn {
  createTimeSlot: (payload: CreateTimeSlotPayload) => Promise<void>;
  updateTimeSlot: (id: string, payload: UpdateTimeSlotPayload) => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
}

export function useTimeSlotActions(refetch: () => void): UseTimeSlotActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const createTimeSlot = async (payload: CreateTimeSlotPayload): Promise<void> => {
    await timeSlotService.createTimeSlot(ensureToken(), payload);
    refetch();
  };

  const updateTimeSlot = async (id: string, payload: UpdateTimeSlotPayload): Promise<void> => {
    await timeSlotService.updateTimeSlot(ensureToken(), id, payload);
    refetch();
  };

  const deleteTimeSlot = async (id: string): Promise<void> => {
    await timeSlotService.deleteTimeSlot(ensureToken(), id);
    refetch();
  };

  return { createTimeSlot, updateTimeSlot, deleteTimeSlot };
}
