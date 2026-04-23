import type { CartItem } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export interface CartApiItem {
  id: string;
  dishId: string;
  quantity: number;
  dish: {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export class CartService {
  private readonly base: string;

  constructor(base: string = BASE_URL) {
    this.base = base;
  }

  async getCart(token: string): Promise<CartApiItem[]> {
    const res = await fetch(`${this.base}/api/me/cart`, { headers: authHeaders(token) });
    return handleResponse<CartApiItem[]>(res);
  }

  async upsertItem(token: string, dishId: string, quantity: number): Promise<CartApiItem> {
    const res = await fetch(`${this.base}/api/me/cart/items`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ dishId, quantity }),
    });
    return handleResponse<CartApiItem>(res);
  }

  async removeItem(token: string, dishId: string): Promise<void> {
    const res = await fetch(`${this.base}/api/me/cart/items/${dishId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async clearCart(token: string): Promise<void> {
    const res = await fetch(`${this.base}/api/me/cart`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async syncCart(token: string, items: { dishId: string; quantity: number }[]): Promise<CartApiItem[]> {
    const res = await fetch(`${this.base}/api/me/cart/sync`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ items }),
    });
    return handleResponse<CartApiItem[]>(res);
  }

  // Convert API response to local CartItem shape
  static toCartItems(apiItems: CartApiItem[]): CartItem[] {
    return apiItems.map((i) => ({
      dish: {
        id: i.dish.id,
        name: i.dish.name,
        imageUrl: i.dish.imageUrl ?? '',
        description: i.dish.description,
        price: i.dish.price,
        isActive: i.dish.isActive,
        createdAt: i.dish.createdAt,
        updatedAt: i.dish.updatedAt,
      },
      quantity: i.quantity,
    }));
  }
}
