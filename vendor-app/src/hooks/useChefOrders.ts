import { useCallback, useEffect, useState } from 'react';
import { ChefService } from '../services/chef.service';
import type { ChefOrder } from '../types';
import { useAuth } from './useAuth';

const chefService = new ChefService();

interface UseChefOrdersReturn {
  orders: ChefOrder[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useChefOrders(): UseChefOrdersReturn {
  const { token } = useAuth();
  const [orders, setOrders] = useState<ChefOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    chefService
      .getTodayOrders(token)
      .then((data) => {
        setOrders(data);
        setError('');
      })
      .catch(() => setError("Failed to load today's orders."))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setError('');
    setTrigger((current) => current + 1);
  }, []);

  return { orders, isLoading, error, refetch };
}
