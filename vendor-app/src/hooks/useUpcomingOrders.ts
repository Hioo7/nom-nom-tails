import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { OrderService } from '../services/order.service';
import type { AdminUpcomingOrder } from '../types';

const orderService = new OrderService();

interface UseUpcomingOrdersReturn {
  orders: AdminUpcomingOrder[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useUpcomingOrders(): UseUpcomingOrdersReturn {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminUpcomingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    orderService
      .listUpcomingOrders(token)
      .then((data) => {
        setOrders(data);
        setError('');
      })
      .catch(() => setError('Failed to load upcoming orders.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((current) => current + 1);
  }, []);

  return { orders, isLoading, error, refetch };
}
