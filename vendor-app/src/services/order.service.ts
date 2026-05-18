import type {
  AdminOrderDetails,
  AdminUpcomingOrder,
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  PendingSettlementOrder,
  ProcurementSummary,
  RecordSettlementPaymentPayload,
} from '../types';

export interface IOrderService {
  listUpcomingOrders(token: string): Promise<AdminUpcomingOrder[]>;
  listByMonth(token: string, month: string): Promise<AdminUpcomingOrder[]>;
  getOrderDetails(token: string, id: string): Promise<AdminOrderDetails>;
  getUpcomingProcurement(token: string): Promise<ProcurementSummary>;
  approveOrder(token: string, id: string): Promise<void>;
  rejectOrder(token: string, id: string): Promise<void>;
  fulfillOrder(token: string, id: string): Promise<void>;
  listPendingSettlements(token: string): Promise<PendingSettlementOrder[]>;
  recordSettlementPayment(
    token: string,
    orderId: string,
    payload: RecordSettlementPaymentPayload,
  ): Promise<PendingSettlementOrder>;
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

export class OrderService implements IOrderService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listUpcomingOrders(token: string): Promise<AdminUpcomingOrder[]> {
    const res = await fetch(`${this.baseUrl}/api/orders/upcoming`, {
      headers: authHeaders(token),
    });
    return handleResponse<AdminUpcomingOrder[]>(res);
  }

  async listByMonth(token: string, month: string): Promise<AdminUpcomingOrder[]> {
    const res = await fetch(`${this.baseUrl}/api/orders/by-month?month=${month}`, {
      headers: authHeaders(token),
    });
    return handleResponse<AdminUpcomingOrder[]>(res);
  }

  async getOrderDetails(token: string, id: string): Promise<AdminOrderDetails> {
    const res = await fetch(`${this.baseUrl}/api/orders/${id}`, {
      headers: authHeaders(token),
    });
    return handleResponse<AdminOrderDetails>(res);
  }

  async getUpcomingProcurement(token: string): Promise<ProcurementSummary> {
    const res = await fetch(`${this.baseUrl}/api/orders/upcoming/procurement`, {
      headers: authHeaders(token),
    });
    return handleResponse<ProcurementSummary>(res);
  }

  async approveOrder(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/orders/${id}/approve`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async rejectOrder(token: string, id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/orders/${id}/reject`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  }

  async fulfillOrder(token: string, id: string, handlingNotes?: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/orders/${id}/fulfill`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(handlingNotes ? { handlingNotes } : {}),
    });
    return handleResponse<void>(res);
  }

  async listPendingSettlements(token: string): Promise<PendingSettlementOrder[]> {
    const res = await fetch(`${this.baseUrl}/api/orders/settlements`, {
      headers: authHeaders(token),
    });
    return handleResponse<PendingSettlementOrder[]>(res);
  }

  async recordSettlementPayment(
    token: string,
    orderId: string,
    payload: RecordSettlementPaymentPayload,
  ): Promise<PendingSettlementOrder> {
    const res = await fetch(`${this.baseUrl}/api/orders/${orderId}/payments`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<PendingSettlementOrder>(res);
  }
}
