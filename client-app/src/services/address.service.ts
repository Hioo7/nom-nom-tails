import type { StoredAddress } from '../lib/addressStore';
import { BASE_URL, authHeaders, handleResponse } from './api';

export interface CurrentLocation {
  id: string;
  lat: number;
  lng: number;
  displayName: string;
}

export class AddressService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getCurrentLocation(token: string): Promise<CurrentLocation | null> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses/current-location`, {
      headers: authHeaders(token),
    });
    return handleResponse<CurrentLocation | null>(res);
  }

  async upsertCurrentLocation(token: string, lat: number, lng: number, displayName: string): Promise<CurrentLocation> {
    const res = await fetch(`${this.baseUrl}/api/me/addresses/current-location`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ lat, lng, displayName }),
    });
    return handleResponse<CurrentLocation>(res);
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
