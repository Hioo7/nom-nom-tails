import { useCallback, useEffect, useState } from 'react';
import { MealPlanService } from '../services/mealPlan.service';
import type { MealPlan } from '../types';
import { useAuth } from './useAuth';

const mealPlanService = new MealPlanService();

interface UseMealPlansReturn {
  mealPlans: MealPlan[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useMealPlans(): UseMealPlansReturn {
  const { token } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    mealPlanService
      .listMealPlans(token)
      .then((data) => {
        setMealPlans(data);
        setError('');
      })
      .catch(() => setError('Failed to load meal plans.'))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((t) => t + 1);
  }, []);

  return { mealPlans, isLoading, error, refetch };
}
