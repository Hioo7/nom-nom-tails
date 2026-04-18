import type { ApiError, ApiErrorResponse, ApiSuccessResponse, LoginPayload, LoginResponseData } from '../types';

export interface IAuthService {
  login(payload: LoginPayload): Promise<LoginResponseData>;
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

export class AuthService implements IAuthService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<LoginResponseData>(res);
  }
}
