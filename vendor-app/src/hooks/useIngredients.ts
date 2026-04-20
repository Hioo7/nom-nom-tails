import { useCallback, useEffect, useState } from 'react';
import ingredientService from '../services/ingredient.service';
import type { IngredientOption } from '../types';
import { useAuth } from './useAuth';

export default function useIngredients() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!token) return;
    ingredientService
      .listIngredients(token)
      .then((data) => {
        setIngredients(data);
        setError('');
      })
      .catch(() => {
        setIngredients([]);
        setError('Failed to load ingredients.');
      })
      .finally(() => setIsLoading(false));
  }, [token, trigger]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError('');
    setTrigger((t) => t + 1);
  }, []);

  return { ingredients, isLoading, error, refetch };
}
