import type { IngredientOption } from '../types';
import { IngredientService } from '../services/ingredient.service';
import { useAuth } from './useAuth';

const ingredientService = new IngredientService();

interface UseIngredientStockActionsReturn {
  increaseStock: (ingredientId: string, quantity: number) => Promise<IngredientOption>;
  decreaseStock: (ingredientId: string, quantity: number) => Promise<IngredientOption>;
}

export function useIngredientStockActions(): UseIngredientStockActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const increaseStock = async (
    ingredientId: string,
    quantity: number,
  ): Promise<IngredientOption> => ingredientService.increaseStock(ensureToken(), ingredientId, { quantity });

  const decreaseStock = async (
    ingredientId: string,
    quantity: number,
  ): Promise<IngredientOption> => ingredientService.decreaseStock(ensureToken(), ingredientId, { quantity });

  return { increaseStock, decreaseStock };
}
