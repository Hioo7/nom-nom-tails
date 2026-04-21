import type { AuthResponseData, LoginPayload, RegisterPayload } from '../types';
import { BASE_URL, handleResponse, jsonHeaders } from './api';

export interface IAuthService {
  login(payload: LoginPayload): Promise<AuthResponseData>;
  register(payload: RegisterPayload): Promise<AuthResponseData>;
}

export class AuthService implements IAuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponseData>(res);
  }

  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponseData>(res);
  }
}
