import type { SafeUser, UpdateMePayload } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export interface IMeService {
  getMe(token: string): Promise<SafeUser>;
  updateMe(token: string, payload: UpdateMePayload): Promise<SafeUser>;
}

export class MeService implements IMeService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getMe(token: string): Promise<SafeUser> {
    const res = await fetch(`${this.baseUrl}/api/me`, {
      headers: authHeaders(token),
    });
    return handleResponse<SafeUser>(res);
  }

  async updateMe(token: string, payload: UpdateMePayload): Promise<SafeUser> {
    const res = await fetch(`${this.baseUrl}/api/me`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<SafeUser>(res);
  }
}
