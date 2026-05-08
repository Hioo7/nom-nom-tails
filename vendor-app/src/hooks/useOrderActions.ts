import type { RecordSettlementPaymentPayload } from '../types';
import { OrderService } from '../services/order.service';
import { useAuth } from './useAuth';

const orderService = new OrderService();

interface UseOrderActionsOptions {
  onUpcomingChanged?: () => void;
  onSettlementsChanged?: () => void;
}

interface UseOrderActionsReturn {
  approveOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  fulfillOrder: (orderId: string, handlingNotes?: string) => Promise<void>;
  recordSettlementPayment: (
    orderId: string,
    payload: RecordSettlementPaymentPayload,
  ) => Promise<void>;
}

export function useOrderActions(options: UseOrderActionsOptions): UseOrderActionsReturn {
  const { token } = useAuth();

  const ensureToken = (): string => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    return token;
  };

  const approveOrder = async (orderId: string): Promise<void> => {
    await orderService.approveOrder(ensureToken(), orderId);
    options.onUpcomingChanged?.();
  };

  const rejectOrder = async (orderId: string): Promise<void> => {
    await orderService.rejectOrder(ensureToken(), orderId);
    options.onUpcomingChanged?.();
  };

  const fulfillOrder = async (orderId: string, handlingNotes?: string): Promise<void> => {
    await orderService.fulfillOrder(ensureToken(), orderId, handlingNotes);
    options.onUpcomingChanged?.();
  };

  const recordSettlementPayment = async (
    orderId: string,
    payload: RecordSettlementPaymentPayload,
  ): Promise<void> => {
    await orderService.recordSettlementPayment(ensureToken(), orderId, payload);
    options.onSettlementsChanged?.();
  };

  return { approveOrder, rejectOrder, fulfillOrder, recordSettlementPayment };
}
