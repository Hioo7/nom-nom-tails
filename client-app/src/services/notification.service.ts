import type { AppNotification } from '../types';
import { BASE_URL, authHeaders, handleResponse } from './api';

export class NotificationService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async list(token: string): Promise<AppNotification[]> {
    const res = await fetch(`${this.baseUrl}/api/notifications`, {
      headers: authHeaders(token),
    });
    return handleResponse<AppNotification[]>(res);
  }

  async getUnreadCount(token: string): Promise<number> {
    const res = await fetch(`${this.baseUrl}/api/notifications/unread-count`, {
      headers: authHeaders(token),
    });
    const data = await handleResponse<{ count: number }>(res);
    return data.count;
  }

  async markAllRead(token: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/notifications/mark-read`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }
}
