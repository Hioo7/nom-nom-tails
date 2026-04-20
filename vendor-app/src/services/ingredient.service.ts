import type { IngredientOption } from '../types';

interface CreateIngredientPayload {
  name: string;
  unit: string;
  availableQty?: number;
}

interface UpdateIngredientPayload {
  name?: string;
  unit?: string;
}

export interface AdjustIngredientStockPayload {
  quantity: number;
}

interface ApiSuccessResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

async function handleIngredientResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  let payload: ApiSuccessResponse<T> | ApiErrorResponse | null = null;

  if (text) {
    payload = JSON.parse(text) as ApiSuccessResponse<T> | ApiErrorResponse;
  }

  if (!res.ok) {
    const errorMessage =
      payload && 'error' in payload ? (payload.error?.message ?? fallbackMessage) : fallbackMessage;
    throw new Error(errorMessage);
  }

  return (payload as ApiSuccessResponse<T>).data;
}

export class IngredientService {
  async listIngredients(token: string): Promise<IngredientOption[]> {
    const res = await fetch('/api/ingredients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleIngredientResponse<IngredientOption[]>(res, 'Failed to fetch ingredients');
  }

  async createIngredient(token: string, payload: CreateIngredientPayload): Promise<IngredientOption> {
    const res = await fetch('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleIngredientResponse<IngredientOption>(res, 'Failed to create ingredient');
  }

  async updateIngredient(
    token: string,
    ingredientId: string,
    payload: UpdateIngredientPayload,
  ): Promise<IngredientOption> {
    const res = await fetch(`/api/ingredients/${ingredientId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleIngredientResponse<IngredientOption>(res, 'Failed to update ingredient');
  }

  async increaseStock(
    token: string,
    ingredientId: string,
    payload: AdjustIngredientStockPayload,
  ): Promise<IngredientOption> {
    const res = await fetch(`/api/ingredients/${ingredientId}/increase-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleIngredientResponse<IngredientOption>(res, 'Failed to add ingredient stock');
  }

  async decreaseStock(
    token: string,
    ingredientId: string,
    payload: AdjustIngredientStockPayload,
  ): Promise<IngredientOption> {
    const res = await fetch(`/api/ingredients/${ingredientId}/decrease-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleIngredientResponse<IngredientOption>(res, 'Failed to reduce ingredient stock');
  }
}

export default new IngredientService();
