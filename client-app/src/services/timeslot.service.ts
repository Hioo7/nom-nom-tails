import type { TimeSlot } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export class TimeSlotService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async listActive(token: string): Promise<TimeSlot[]> {
    const res = await fetch(`${this.baseUrl}/api/customer/timeslots`, {
      headers: authHeaders(token),
    });
    return handleResponse<TimeSlot[]>(res);
  }
}
