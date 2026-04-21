import type { CreateOrderPayload, Order } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export interface IOrderService {
  create(token: string, payload: CreateOrderPayload): Promise<Order>;
  listMine(token: string): Promise<Order[]>;
}

export class OrderService implements IOrderService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async create(token: string, payload: CreateOrderPayload): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/api/customer/orders`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(res);
  }

  async listMine(token: string): Promise<Order[]> {
    const res = await fetch(`${this.baseUrl}/api/customer/orders`, {
      headers: authHeaders(token),
    });
    return handleResponse<Order[]>(res);
  }
}
