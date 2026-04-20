import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateMealPlanPayload,
  MealPlan,
  UpdateMealPlanPayload,
} from '../types';

export interface IMealPlanService {
  listMealPlans(token: string): Promise<MealPlan[]>;
  getMealPlan(token: string, id: string): Promise<MealPlan>;
  createMealPlan(token: string, payload: CreateMealPlanPayload): Promise<MealPlan>;
  updateMealPlan(token: string, id: string, payload: UpdateMealPlanPayload): Promise<MealPlan>;
  deleteMealPlan(token: string, id: string): Promise<void>;
  uploadImage(token: string, mealPlanId: string, file: File): Promise<string>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw { message: `Server error (${res.status})` } satisfies ApiError;
  }
  if (!res.ok) {
    throw (json as ApiErrorResponse).error satisfies ApiError;
  }
  return (json as ApiSuccessResponse<T>).data;
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export class MealPlanService implements IMealPlanService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listMealPlans(token: string): Promise<MealPlan[]> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans`, {
      headers: authHeaders(token),
    });
    return handleResponse<MealPlan[]>(res);
  }

  async getMealPlan(token: string, id: string): Promise<MealPlan> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans/${id}`, {
      headers: authHeaders(token),
    });
    return handleResponse<MealPlan>(res);
  }

  async createMealPlan(token: string, payload: CreateMealPlanPayload): Promise<MealPlan> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<MealPlan>(res);
  }

  async updateMealPlan(
    token: string,
    id: string,
    payload: UpdateMealPlanPayload,
  ): Promise<MealPlan> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<MealPlan>(res);
  }

  async deleteMealPlan(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async uploadImage(token: string, mealPlanId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${this.baseUrl}/api/meal-plans/${mealPlanId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await handleResponse<{ url: string }>(res);
    return result.url;
  }
}
