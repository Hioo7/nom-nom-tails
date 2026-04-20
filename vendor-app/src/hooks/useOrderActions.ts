import type { RecordSettlementPaymentPayload } from '../types';
import { OrderService } from '../services/order.service';
import { useAuth } from './useAuth';

const orderService = new OrderService();

interface UseOrderActionsOptions {
  onUpcomingChanged?: () => void;
  onSettlementsChanged?: () => void;
}

interface UseOrderActionsReturn {
  fulfillOrder: (orderId: string) => Promise<void>;
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

  const fulfillOrder = async (orderId: string): Promise<void> => {
    await orderService.fulfillOrder(ensureToken(), orderId);
    options.onUpcomingChanged?.();
  };

  const recordSettlementPayment = async (
    orderId: string,
    payload: RecordSettlementPaymentPayload,
  ): Promise<void> => {
    await orderService.recordSettlementPayment(ensureToken(), orderId, payload);
    options.onSettlementsChanged?.();
  };

  return { fulfillOrder, recordSettlementPayment };
}
