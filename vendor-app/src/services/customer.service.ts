import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  CustomerSummary,
  UpdateCustomerLoyaltyPayload,
} from '../types';

export interface ICustomerService {
  listCustomers(token: string): Promise<CustomerSummary[]>;
  updateCustomerLoyalty(
    token: string,
    id: string,
    payload: UpdateCustomerLoyaltyPayload,
  ): Promise<CustomerSummary>;
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

export class CustomerService implements ICustomerService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listCustomers(token: string): Promise<CustomerSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/customers`, {
      headers: authHeaders(token),
    });

    return handleResponse<CustomerSummary[]>(res);
  }

  async updateCustomerLoyalty(
    token: string,
    id: string,
    payload: UpdateCustomerLoyaltyPayload,
  ): Promise<CustomerSummary> {
    const res = await fetch(`${this.baseUrl}/api/customers/${id}/loyalty`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    return handleResponse<CustomerSummary>(res);
  }
}
