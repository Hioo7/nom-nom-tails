import { useCallback, useEffect, useState } from 'react';
import { DeliveryPartnerService } from '../services/deliveryPartner.service';
import type { DeliveryPartnerTaskSummary } from '../types';
import { useAuth } from './useAuth';

const deliveryPartnerService = new DeliveryPartnerService();

interface UseDeliveryPartnerTasksReturn {
  availableTasks: DeliveryPartnerTaskSummary[];
  myTasks: DeliveryPartnerTaskSummary[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useDeliveryPartnerTasks(): UseDeliveryPartnerTasksReturn {
  const { token } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<DeliveryPartnerTaskSummary[]>([]);
  const [myTasks, setMyTasks] = useState<DeliveryPartnerTaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(() => token !== null);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    Promise.all([
      deliveryPartnerService.listAvailableTasks(token),
      deliveryPartnerService.listMyTasks(token),
    ])
      .then(([available, mine]) => {
        setAvailableTasks(available);
        setMyTasks(mine);
        setError('');
      })
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((current) => current + 1);
  }, []);

  return { availableTasks, myTasks, isLoading, error, refetch };
}
