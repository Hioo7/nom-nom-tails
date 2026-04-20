import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { OrderService } from '../services/order.service';
import type { PendingSettlementOrder } from '../types';

const orderService = new OrderService();

interface UsePendingSettlementsReturn {
  settlements: PendingSettlementOrder[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function usePendingSettlements(): UsePendingSettlementsReturn {
  const { token } = useAuth();
  const [settlements, setSettlements] = useState<PendingSettlementOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    orderService
      .listPendingSettlements(token)
      .then((data) => {
        setSettlements(data);
        setError('');
      })
      .catch(() => setError('Failed to load pending settlements.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((current) => current + 1);
  }, []);

  return { settlements, isLoading, error, refetch };
}
