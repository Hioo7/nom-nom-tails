import type { Subscription, CreateSubscriptionPayload } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export class SubscriptionService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async create(token: string, payload: CreateSubscriptionPayload): Promise<Subscription> {
    const res = await fetch(`${this.baseUrl}/api/customer/subscriptions`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<Subscription>(res);
  }

  async listMine(token: string): Promise<Subscription[]> {
    const res = await fetch(`${this.baseUrl}/api/customer/subscriptions`, {
      headers: authHeaders(token),
    });
    return handleResponse<Subscription[]>(res);
  }
}
