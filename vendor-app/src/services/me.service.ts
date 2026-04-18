import type { ApiError, ApiErrorResponse, ApiSuccessResponse, SafeUser, UpdateMePayload } from '../types';

export interface IMeService {
  getMe(token: string): Promise<SafeUser>;
  updateMe(token: string, payload: UpdateMePayload): Promise<SafeUser>;
}

async function handleResponse<T>(res: Response): Promise<T> {
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

export class MeService implements IMeService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
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
