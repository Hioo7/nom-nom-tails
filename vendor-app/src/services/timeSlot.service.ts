import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateTimeSlotPayload,
  DayOfWeek,
  TimeSlot,
  UpdateTimeSlotPayload,
} from '../types';

export interface ITimeSlotService {
  listByDay(token: string, day: DayOfWeek): Promise<TimeSlot[]>;
  createTimeSlot(token: string, payload: CreateTimeSlotPayload): Promise<TimeSlot>;
  updateTimeSlot(token: string, id: string, payload: UpdateTimeSlotPayload): Promise<TimeSlot>;
  deleteTimeSlot(token: string, id: string): Promise<void>;
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

export class TimeSlotService implements ITimeSlotService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listByDay(token: string, day: DayOfWeek): Promise<TimeSlot[]> {
    const res = await fetch(`${this.baseUrl}/api/time-slots?day=${day}`, {
      headers: authHeaders(token),
    });
    return handleResponse<TimeSlot[]>(res);
  }

  async createTimeSlot(token: string, payload: CreateTimeSlotPayload): Promise<TimeSlot> {
    const res = await fetch(`${this.baseUrl}/api/time-slots`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<TimeSlot>(res);
  }

  async updateTimeSlot(
    token: string,
    id: string,
    payload: UpdateTimeSlotPayload,
  ): Promise<TimeSlot> {
    const res = await fetch(`${this.baseUrl}/api/time-slots/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<TimeSlot>(res);
  }

  async deleteTimeSlot(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/time-slots/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }
}
