import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  DeliveryPartnerSummary,
  FailDeliveryTaskPayload,
  DeliveryPartnerTaskSummary,
} from '../types';

export interface IDeliveryPartnerService {
  listPartnersWithTodayDeliveries(token: string): Promise<DeliveryPartnerSummary[]>;
  listAvailableTasks(token: string): Promise<DeliveryPartnerTaskSummary[]>;
  listAllAvailableTasks(token: string): Promise<DeliveryPartnerTaskSummary[]>;
  listMyTasks(token: string): Promise<DeliveryPartnerTaskSummary[]>;
  acceptTask(token: string, taskId: string): Promise<void>;
  failTask(token: string, taskId: string, payload: FailDeliveryTaskPayload): Promise<void>;
  completeTask(token: string, taskId: string, file: File): Promise<void>;
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

export class DeliveryPartnerService implements IDeliveryPartnerService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listPartnersWithTodayDeliveries(token: string): Promise<DeliveryPartnerSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners`, {
      headers: authHeaders(token),
    });
    return handleResponse<DeliveryPartnerSummary[]>(res);
  }

  async listAvailableTasks(token: string): Promise<DeliveryPartnerTaskSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners/me/available-tasks`, {
      headers: authHeaders(token),
    });
    return handleResponse<DeliveryPartnerTaskSummary[]>(res);
  }

  async listAllAvailableTasks(token: string): Promise<DeliveryPartnerTaskSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners/me/all-available-tasks`, {
      headers: authHeaders(token),
    });
    return handleResponse<DeliveryPartnerTaskSummary[]>(res);
  }

  async listMyTasks(token: string): Promise<DeliveryPartnerTaskSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners/me/tasks`, {
      headers: authHeaders(token),
    });
    return handleResponse<DeliveryPartnerTaskSummary[]>(res);
  }

  async acceptTask(token: string, taskId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners/tasks/${taskId}/accept`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async failTask(token: string, taskId: string, payload: FailDeliveryTaskPayload): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/delivery-partners/tasks/${taskId}/fail`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<void>(res);
  }

  async completeTask(token: string, taskId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${this.baseUrl}/api/delivery-partners/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return handleResponse<void>(res);
  }
}
