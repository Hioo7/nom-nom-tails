import { DishService } from '../services/dish.service';
import type { CreateDishPayload, UpdateDishPayload } from '../types';
import { useAuth } from './useAuth';

const dishService = new DishService();

interface UseDishActionsReturn {
  createDish: (payload: CreateDishPayload, imageFile?: File) => Promise<void>;
  updateDish: (id: string, payload: UpdateDishPayload, imageFile?: File) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;
}

export function useDishActions(refetch: () => void): UseDishActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const createDish = async (payload: CreateDishPayload, imageFile?: File): Promise<void> => {
    const t = ensureToken();
    const dish = await dishService.createDish(t, payload);
    if (imageFile) {
      const url = await dishService.uploadImage(t, dish.id, imageFile);
      await dishService.updateDish(t, dish.id, { imageUrl: url });
    }
    refetch();
  };

  const updateDish = async (
    id: string,
    payload: UpdateDishPayload,
    imageFile?: File,
  ): Promise<void> => {
    const t = ensureToken();
    let finalPayload = payload;
    if (imageFile) {
      const url = await dishService.uploadImage(t, id, imageFile);
      finalPayload = { ...payload, imageUrl: url };
    }
    await dishService.updateDish(t, id, finalPayload);
    refetch();
  };

  const deleteDish = async (id: string): Promise<void> => {
    await dishService.deleteDish(ensureToken(), id);
    refetch();
  };

  return { createDish, updateDish, deleteDish };
}
