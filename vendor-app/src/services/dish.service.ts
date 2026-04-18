import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateDishPayload,
  Dish,
  UpdateDishPayload,
} from '../types';

export interface IDishService {
  listDishes(token: string): Promise<Dish[]>;
  getDish(token: string, id: string): Promise<Dish>;
  createDish(token: string, payload: CreateDishPayload): Promise<Dish>;
  updateDish(token: string, id: string, payload: UpdateDishPayload): Promise<Dish>;
  deleteDish(token: string, id: string): Promise<void>;
  uploadImage(token: string, dishId: string, file: File): Promise<string>;
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

export class DishService implements IDishService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listDishes(token: string): Promise<Dish[]> {
    const res = await fetch(`${this.baseUrl}/api/dishes`, {
      headers: authHeaders(token),
    });
    return handleResponse<Dish[]>(res);
  }

  async getDish(token: string, id: string): Promise<Dish> {
    const res = await fetch(`${this.baseUrl}/api/dishes/${id}`, {
      headers: authHeaders(token),
    });
    return handleResponse<Dish>(res);
  }

  async createDish(token: string, payload: CreateDishPayload): Promise<Dish> {
    const res = await fetch(`${this.baseUrl}/api/dishes`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<Dish>(res);
  }

  async updateDish(token: string, id: string, payload: UpdateDishPayload): Promise<Dish> {
    const res = await fetch(`${this.baseUrl}/api/dishes/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<Dish>(res);
  }

  async deleteDish(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/dishes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async uploadImage(token: string, dishId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${this.baseUrl}/api/dishes/${dishId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await handleResponse<{ url: string }>(res);
    return result.url;
  }
}
