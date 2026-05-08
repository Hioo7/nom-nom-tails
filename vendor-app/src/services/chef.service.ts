import type { ApiError, ApiErrorResponse, ApiSuccessResponse, ChefOrder } from '../types';

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

export interface IChefService {
  getTodayOrders(token: string): Promise<ChefOrder[]>;
  fulfillOrder(token: string, orderId: string, handlingNotes?: string): Promise<void>;
}

export class ChefService implements IChefService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getTodayOrders(token: string): Promise<ChefOrder[]> {
    const res = await fetch(`${this.baseUrl}/api/chef/orders`, {
      headers: authHeaders(token),
    });
    return handleResponse<ChefOrder[]>(res);
  }

  async fulfillOrder(token: string, orderId: string, handlingNotes?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/chef/orders/${orderId}/fulfill`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(handlingNotes ? { handlingNotes } : {}),
    });
    return handleResponse<void>(res);
  }
}
