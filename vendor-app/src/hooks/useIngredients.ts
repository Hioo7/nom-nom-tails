import { useCallback, useEffect, useState } from 'react';
import ingredientService from '../services/ingredient.service';
import type { IngredientOption } from '../types';
import { useAuth } from './useAuth';

export default function useIngredients() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    ingredientService
      .listIngredients(token)
      .then((data) => setIngredients(data))
      .catch(() => setIngredients([]))
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setTrigger((t) => t + 1);
  }, []);

  return { ingredients, isLoading, refetch };
}
