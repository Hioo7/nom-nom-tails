import type { ApiError as ApiErrorData, ApiErrorResponse, ApiSuccessResponse } from '../types';

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.nomnomtails.com';

export class ApiError extends Error implements ApiErrorData {
  readonly fields?: ApiErrorData['fields'];

  constructor(message: string, fields?: ApiErrorData['fields']) {
    super(message);
    this.name = 'ApiError';
    this.fields = fields;
  }
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(`Server error (${res.status})`);
  }
  if (!res.ok) {
    const err = (json as ApiErrorResponse).error;
    throw new ApiError(err?.message ?? 'Something went wrong', err?.fields);
  }
  return (json as ApiSuccessResponse<T>).data;
}

export function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function jsonHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}
