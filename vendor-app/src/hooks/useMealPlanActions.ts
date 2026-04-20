import { MealPlanService } from '../services/mealPlan.service';
import type { CreateMealPlanPayload, UpdateMealPlanPayload } from '../types';
import { useAuth } from './useAuth';

const mealPlanService = new MealPlanService();

interface UseMealPlanActionsReturn {
  createMealPlan: (payload: CreateMealPlanPayload, imageFile?: File) => Promise<void>;
  updateMealPlan: (id: string, payload: UpdateMealPlanPayload, imageFile?: File) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
}

export function useMealPlanActions(refetch: () => void): UseMealPlanActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const createMealPlan = async (
    payload: CreateMealPlanPayload,
    imageFile?: File,
  ): Promise<void> => {
    const t = ensureToken();
    const plan = await mealPlanService.createMealPlan(t, payload);
    if (imageFile) {
      const url = await mealPlanService.uploadImage(t, plan.id, imageFile);
      await mealPlanService.updateMealPlan(t, plan.id, { imageUrl: url });
    }
    refetch();
  };

  const updateMealPlan = async (
    id: string,
    payload: UpdateMealPlanPayload,
    imageFile?: File,
  ): Promise<void> => {
    const t = ensureToken();
    let finalPayload = payload;
    if (imageFile) {
      const url = await mealPlanService.uploadImage(t, id, imageFile);
      finalPayload = { ...payload, imageUrl: url };
    }
    await mealPlanService.updateMealPlan(t, id, finalPayload);
    refetch();
  };

  const deleteMealPlan = async (id: string): Promise<void> => {
    await mealPlanService.deleteMealPlan(ensureToken(), id);
    refetch();
  };

  return { createMealPlan, updateMealPlan, deleteMealPlan };
}
