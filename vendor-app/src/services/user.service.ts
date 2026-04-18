import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateUserPayload,
  SafeUser,
  UpdateUserPayload,
} from '../types';

export interface IUserService {
  listUsers(token: string): Promise<SafeUser[]>;
  createUser(token: string, payload: CreateUserPayload): Promise<SafeUser>;
  updateUser(token: string, id: string, payload: UpdateUserPayload): Promise<SafeUser>;
  deleteUser(token: string, id: string): Promise<void>;
}

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

export class UserService implements IUserService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listUsers(token: string): Promise<SafeUser[]> {
    const res = await fetch(`${this.baseUrl}/api/users`, {
      headers: authHeaders(token),
    });
    return handleResponse<SafeUser[]>(res);
  }

  async createUser(token: string, payload: CreateUserPayload): Promise<SafeUser> {
    const res = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<SafeUser>(res);
  }

  async updateUser(token: string, id: string, payload: UpdateUserPayload): Promise<SafeUser> {
    const res = await fetch(`${this.baseUrl}/api/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<SafeUser>(res);
  }

  async deleteUser(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }
}
