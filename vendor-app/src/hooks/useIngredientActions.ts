import type { IngredientOption } from '../types';
import { IngredientService } from '../services/ingredient.service';
import { useAuth } from './useAuth';

const ingredientService = new IngredientService();

interface CreateIngredientInput {
  name: string;
  unit: string;
  availableQty?: number;
}

interface UpdateIngredientInput {
  name?: string;
  unit?: string;
}

interface UseIngredientActionsReturn {
  createIngredient: (payload: CreateIngredientInput) => Promise<IngredientOption>;
  updateIngredient: (ingredientId: string, payload: UpdateIngredientInput) => Promise<IngredientOption>;
  increaseStock: (ingredientId: string, quantity: number) => Promise<IngredientOption>;
  decreaseStock: (ingredientId: string, quantity: number) => Promise<IngredientOption>;
}

export function useIngredientActions(): UseIngredientActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const createIngredient = async (
    payload: CreateIngredientInput,
  ): Promise<IngredientOption> => ingredientService.createIngredient(ensureToken(), payload);

  const updateIngredient = async (
    ingredientId: string,
    payload: UpdateIngredientInput,
  ): Promise<IngredientOption> => ingredientService.updateIngredient(ensureToken(), ingredientId, payload);

  const increaseStock = async (
    ingredientId: string,
    quantity: number,
  ): Promise<IngredientOption> => ingredientService.increaseStock(ensureToken(), ingredientId, { quantity });

  const decreaseStock = async (
    ingredientId: string,
    quantity: number,
  ): Promise<IngredientOption> => ingredientService.decreaseStock(ensureToken(), ingredientId, { quantity });

  return { createIngredient, updateIngredient, increaseStock, decreaseStock };
}
