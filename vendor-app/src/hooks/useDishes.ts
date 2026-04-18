import { useCallback, useEffect, useState } from 'react';
import { DishService } from '../services/dish.service';
import type { Dish } from '../types';
import { useAuth } from './useAuth';

const dishService = new DishService();

interface UseDishesReturn {
  dishes: Dish[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useDishes(): UseDishesReturn {
  const { token } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    dishService
      .listDishes(token)
      .then((data) => {
        setDishes(data);
        setError('');
      })
      .catch(() => setError('Failed to load dishes.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((t) => t + 1);
  }, []);

  return { dishes, isLoading, error, refetch };
}
