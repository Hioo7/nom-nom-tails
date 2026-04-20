import { useCallback, useEffect, useState } from 'react';
import { TimeSlotService } from '../services/timeSlot.service';
import type { DayOfWeek, TimeSlot } from '../types';
import { useAuth } from './useAuth';

const timeSlotService = new TimeSlotService();

interface UseTimeSlotsReturn {
  slots: TimeSlot[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useTimeSlots(day: DayOfWeek): UseTimeSlotsReturn {
  const { token } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    timeSlotService
      .listByDay(token, day)
      .then((data) => {
        setSlots(data);
        setError('');
      })
      .catch(() => setError('Failed to load time slots.'))
      .finally(() => setIsLoading(false));
  }, [token, day, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((t) => t + 1);
  }, []);

  return { slots, isLoading, error, refetch };
}
