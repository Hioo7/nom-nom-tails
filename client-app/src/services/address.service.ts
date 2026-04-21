import type { StoredAddress } from '../lib/addressStore';
import { BASE_URL, authHeaders, handleResponse } from './api';

export class AddressService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async list(token: string): Promise<StoredAddress[]> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses`, {
      headers: authHeaders(token),
    });
    return handleResponse<StoredAddress[]>(res);
  }

  async create(token: string, data: Omit<StoredAddress, 'id'>): Promise<StoredAddress> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<StoredAddress>(res);
  }

  async update(token: string, id: string, data: Partial<Omit<StoredAddress, 'id'>>): Promise<StoredAddress> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse<StoredAddress>(res);
  }

  async remove(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }
}
